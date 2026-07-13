interface ComingSoonStateProps {
  icon?: string;
  title: string;
  features?: string[];
}

export default function ComingSoonState({ icon = '🚧', title, features }: ComingSoonStateProps) {
  return (
    <div className="shared-coming-soon">
      <div className="shared-coming-icon">{icon}</div>
      <h3 className="shared-coming-title">{title}</h3>
      <p className="shared-coming-desc">内容持续建设中</p>
      {features && features.length > 0 && (
        <div className="shared-coming-features">
          <p className="shared-coming-subtitle">将包含：</p>
          <ul>
            {features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
