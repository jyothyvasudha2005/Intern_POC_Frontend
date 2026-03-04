#!/usr/bin/env python3
import os

css_content = """/* Service Detail Container */
.service-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%);
}

.error-state, .loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

/* Header Section */
.detail-header-section {
  background: white;
  padding: 2rem 3rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border-bottom: 1px solid #e5e7eb;
}

.back-button {
  background: transparent;
  color: #6366f1;
  border: 2px solid #6366f1;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #6366f1;
  color: white;
  transform: translateX(-4px);
}

.service-header-content {
  margin-top: 1rem;
}

.service-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.service-main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.status-deprecated {
  background: #fef3c7;
  color: #92400e;
}

.service-meta-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.meta-badge.meta-link {
  background: #eff6ff;
  color: #1e40af;
  text-decoration: none;
  transition: all 0.2s;
}

.meta-badge.meta-link:hover {
  background: #dbeafe;
  transform: translateY(-2px);
}

.meta-icon {
  font-size: 1.1rem;
}

/* Tabs */
.service-tabs {
  background: white;
  padding: 0 3rem;
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
}

.tab-button {
  background: transparent;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.tab-button:hover {
  color: #6366f1;
  background: #f9fafb;
}

.tab-button.active {
  color: #6366f1;
  border-bottom-color: #6366f1;
}
"""

# Write to file
output_path = os.path.join('src', 'styles', 'ServiceDetail.css')
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, 'w') as f:
    f.write(css_content)

print(f"✅ Created {output_path} (Part 1/3)")

