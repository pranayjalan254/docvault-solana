import "./Staking.css";

const Staking = () => {
  // Placeholder for the list of unverified credentials
  const unverifiedCredentials = [
    {
      id: 1,
      title: "Bachelor's Degree in Computer Science",
      institution: "BITS Pilani",
      description: "Issued in 2023 by the Department of Computer Science.",
      stakeAmount: "10 SOL",
      progress: 59,
    },
    {
      id: 1,
      title: "Bachelor's Degree in Computer Science",
      institution: "BITS Pilani",
      description: "Issued in 2023 by the Department of Computer Science.",
      stakeAmount: "10 SOL",
      progress: 50,
    },
    {
      id: 1,
      title: "Bachelor's Degree in Computer Science",
      institution: "BITS Pilani",
      description: "Issued in 2023 by the Department of Computer Science.",
      stakeAmount: "10 SOL",
      progress: 40,
    },
    {
      id: 1,
      title: "Bachelor's Degree in Computer Science",
      institution: "BITS Pilani",
      description: "Issued in 2023 by the Department of Computer Science.",
      stakeAmount: "10 SOL",
      progress: 10,
    },
    {
      id: 2,
      title: "Frontend Developer Certificate",
      institution: "Coursera",
      description: "Completed in July 2023.",
      stakeAmount: "5 SOL",
      progress: 75,
    },
    // Add more unverified credentials here
  ];

  return (
    <div className="staking-container">
      <div className="coming-soon-overlay">
        <h1>Coming Soon</h1>
        <p>The staking feature is currently under development.</p>
      </div>
      <h1 className="staking-header">Staking Section</h1>
      <div className="staking-subtitle">
        Stake your tokens to verify unverified credentials and earn rewards.
      </div>
      <div className="credential-list">
        {unverifiedCredentials.map((credential) => (
          <div key={credential.id} className="staking-card">
            <h3 className="staking-title">{credential.title}</h3>
            <p className="staking-institution">{credential.institution}</p>
            <p className="staking-description">{credential.description}</p>
            <div className="stake-info">
              <p className="stake-amount">
                Stake Amount: {credential.stakeAmount}
              </p>
              <button className="stake-button">Stake & Verify</button>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${credential.progress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              Verification Progress: {credential.progress}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Staking;
