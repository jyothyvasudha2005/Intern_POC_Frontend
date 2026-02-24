import '../styles/ServiceCard.css'

function ServiceCard({ service, onClick }) {
  return (
    <div className="service-card" onClick={() => onClick(service)}>
      <div className="service-header">
        <div className="service-info">
          <h3 className="service-name">{service.name}</h3>
          <div className="service-type">{service.type}</div>
        </div>
        <span className={`service-status ${service.status}`}>
          {service.status}
        </span>
      </div>
      
      <p className="service-description">{service.description}</p>
      
      <div className="service-tags">
        {service.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
      
      <div className="service-meta">
        <div className="meta-item">
          <span className="meta-label">Owner</span>
          <span className="meta-value">{service.owner}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Version</span>
          <span className="meta-value">{service.version}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Uptime</span>
          <span className="meta-value">{service.uptime}</span>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard

