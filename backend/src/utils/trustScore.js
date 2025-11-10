/**
 * Calculate user trust score based on various factors
 * Score range: 0-100
 */

const calculateTrustScore = (user, reviews = []) => {
  let score = 0;
  const factors = [];

  // 1. Rating Score (max 40 points)
  if (user.rating.count > 0) {
    const ratingScore = (user.rating.average / 5) * 40;
    score += ratingScore;
    factors.push({
      name: 'Rating Quality',
      score: ratingScore,
      maxScore: 40
    });
  }

  // 2. Review Count (max 15 points)
  const reviewCount = user.rating.count;
  let reviewCountScore = 0;
  if (reviewCount >= 50) {
    reviewCountScore = 15;
  } else if (reviewCount >= 20) {
    reviewCountScore = 12;
  } else if (reviewCount >= 10) {
    reviewCountScore = 10;
  } else if (reviewCount >= 5) {
    reviewCountScore = 7;
  } else if (reviewCount >= 1) {
    reviewCountScore = 5;
  }
  score += reviewCountScore;
  factors.push({
    name: 'Review Count',
    score: reviewCountScore,
    maxScore: 15
  });

  // 3. Completion Rate (max 20 points)
  const completionRate = user.stats.tasksPosted > 0
    ? (user.stats.tasksCompleted / (user.stats.tasksPosted + user.stats.tasksCompleted)) * 100
    : user.stats.tasksCompleted > 0 ? 100 : 0;

  const completionScore = (completionRate / 100) * 20;
  score += completionScore;
  factors.push({
    name: 'Completion Rate',
    score: completionScore,
    maxScore: 20
  });

  // 4. Verification Status (max 15 points)
  let verificationScore = 0;
  if (user.verification.email) verificationScore += 5;
  if (user.verification.phone) verificationScore += 5;
  if (user.verification.identity) verificationScore += 5;

  score += verificationScore;
  factors.push({
    name: 'Verification',
    score: verificationScore,
    maxScore: 15
  });

  // 5. Activity Level (max 10 points)
  const totalActivity = user.stats.tasksPosted + user.stats.tasksCompleted;
  let activityScore = 0;
  if (totalActivity >= 50) {
    activityScore = 10;
  } else if (totalActivity >= 20) {
    activityScore = 8;
  } else if (totalActivity >= 10) {
    activityScore = 6;
  } else if (totalActivity >= 5) {
    activityScore = 4;
  } else if (totalActivity >= 1) {
    activityScore = 2;
  }
  score += activityScore;
  factors.push({
    name: 'Activity Level',
    score: activityScore,
    maxScore: 10
  });

  // Calculate trust level
  let trustLevel = 'New';
  if (score >= 80) {
    trustLevel = 'Excellent';
  } else if (score >= 60) {
    trustLevel = 'Good';
  } else if (score >= 40) {
    trustLevel = 'Fair';
  } else if (score >= 20) {
    trustLevel = 'Building';
  }

  return {
    score: Math.round(score),
    level: trustLevel,
    factors
  };
};

const calculateResponseRate = (totalMessages, respondedMessages) => {
  if (totalMessages === 0) return 0;
  return Math.round((respondedMessages / totalMessages) * 100);
};

const getTrustBadges = (user) => {
  const badges = [];

  // Verification badges
  if (user.verification.email) {
    badges.push({ type: 'email_verified', label: 'Email Verified', icon: 'email-check' });
  }
  if (user.verification.phone) {
    badges.push({ type: 'phone_verified', label: 'Phone Verified', icon: 'phone-check' });
  }
  if (user.verification.identity) {
    badges.push({ type: 'identity_verified', label: 'Identity Verified', icon: 'shield-check' });
  }

  // Achievement badges
  if (user.stats.tasksCompleted >= 100) {
    badges.push({ type: 'super_doer', label: 'Super Doer', icon: 'star' });
  } else if (user.stats.tasksCompleted >= 50) {
    badges.push({ type: 'expert_doer', label: 'Expert Doer', icon: 'star-half-full' });
  } else if (user.stats.tasksCompleted >= 10) {
    badges.push({ type: 'experienced', label: 'Experienced', icon: 'check-circle' });
  }

  if (user.rating.average >= 4.8 && user.rating.count >= 10) {
    badges.push({ type: 'top_rated', label: 'Top Rated', icon: 'trophy' });
  }

  if (user.stats.tasksPosted >= 20) {
    badges.push({ type: 'active_poster', label: 'Active Poster', icon: 'post' });
  }

  return badges;
};

module.exports = {
  calculateTrustScore,
  calculateResponseRate,
  getTrustBadges
};
