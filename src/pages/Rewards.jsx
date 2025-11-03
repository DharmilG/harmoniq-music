import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../context/apiClient.js';

function RewardCard({ reward, userTokens, unlocked, onPurchase }) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const canAfford = userTokens >= reward.price;

  const handlePurchase = async () => {
    if (unlocked || !canAfford) return;
    setIsPurchasing(true);
    try {
      await onPurchase(reward.id);
    } catch (error) {
      // Error is handled in the parent component's toast
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className={`card ${!canAfford && !unlocked ? 'disabled' : ''}`} style={{ opacity: !canAfford && !unlocked ? 0.6 : 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {reward.name}
          {unlocked && <span className="badge success small" style={{ marginLeft: 'auto' }}>Unlocked</span>}
        </h3>
        <p className="small muted" style={{ flexGrow: 1 }}>{reward.description}</p>
        <div className="actions">
          <div className="price" style={{ marginRight: 'auto' }}>{reward.price} 🎵 Tokens</div>
          <button
            className="btn primary"
            onClick={handlePurchase}
            disabled={unlocked || !canAfford || isPurchasing}
          >
            {isPurchasing ? 'Unlocking...' : (unlocked ? 'Owned' : 'Unlock')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Rewards() {
  const { user, showToast, refreshUser } = useAuth(); // Use user object directly and add refreshUser
  const [rewards, setRewards] = useState([]);
  const [unlockedRewardIds, setUnlockedRewardIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rewardsRes, unlockedRes] = await Promise.all([
        api('/api/rewards'),
        api('/api/user/rewards'),
      ]);
      setRewards(rewardsRes.rewards || []);
      setUnlockedRewardIds(new Set(unlockedRes.unlockedRewardIds || []));
    } catch (error) {
      showToast(error.message || 'Failed to load rewards data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handlePurchase = async (rewardId) => {
    try {
      await api('/api/user/rewards', {
        method: 'POST',
        body: { rewardId },
      });
      showToast('Reward unlocked successfully!', 'success');
      await refreshUser(); // Refresh the main user object to get the new token balance
      fetchData(); // Re-fetch rewards to update the "Owned" status
    } catch (error) {
      showToast(error.message || 'Purchase failed.', 'error');
      throw error; // re-throw to notify child component
    }
  };

  if (loading) {
    return <section><div className="spinner" style={{ margin: 'var(--space-xl) auto' }}></div></section>;
  }

  return (
    <section>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div>
            <h2>Reward Store</h2>
            <p className="muted">Spend your tokens to unlock new games, content, and more.</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
            Your Balance: <strong>{user?.tokens || 0} 🎵</strong>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {rewards.map(reward => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userTokens={user?.tokens || 0}
              unlocked={unlockedRewardIds.has(reward.id)}
              onPurchase={handlePurchase}
            />
          ))}
        </div>

        <div className="actions" style={{ justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
          <Link to="/learn" className="btn">Back to Learn</Link>
        </div>
      </div>
    </section>
  );
}