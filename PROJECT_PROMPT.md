# Web Scraping Application Development Prompt

## Project Overview
Create a scalable, distributed web scraping application with a modern dashboard interface. The system should be capable of ethical web scraping while respecting rate limits, handling robots.txt files intelligently, and avoiding detection through distributed architecture.

## Core Requirements

### 1. Robots.txt Handling
- **Intelligent Override System**: Implement a configurable system that can optionally ignore robots.txt restrictions
- **Selective Compliance**: Allow per-domain configuration for robots.txt compliance
- **Risk Assessment**: Provide warnings when ignoring robots.txt and suggest alternative approaches
- **Backup Strategies**: When robots.txt blocks access, suggest alternative data sources or API endpoints

### 2. Rate Limiting & Anti-Detection
- **Adaptive Rate Limiting**: Dynamic adjustment based on server response times and HTTP status codes
- **Human-like Behavior**: Random delays between requests (configurable min/max)
- **Request Pattern Variation**: Randomize user agents, headers, and request timing
- **Circuit Breaker Pattern**: Automatic backing off when rate limits are detected
- **Session Management**: Rotate sessions and cookies intelligently

### 3. Distributed EC2 Architecture
- **Multi-Instance Coordination**: Distribute scraping jobs across multiple EC2 instances
- **Load Balancing**: Intelligent job distribution based on instance capacity and location
- **Geographic Distribution**: Use different AWS regions to avoid IP-based blocking
- **Auto-Scaling**: Automatically spin up/down instances based on workload
- **Failover Handling**: Redistribute work when instances fail

### 4. Invisible URL Detection & Handling
- **JavaScript Rendering**: Use headless browsers (Selenium/Playwright) for SPA content
- **Dynamic Content Detection**: Identify and handle AJAX-loaded content
- **Hidden Element Discovery**: Detect and interact with hidden forms, modals, and dropdowns
- **Infinite Scroll Handling**: Automatically handle pagination and infinite scroll
- **Shadow DOM Support**: Handle web components and shadow DOM elements

## Technical Architecture

### Backend (Python)
```
├── Core Engine
│   ├── Scrapy-based scraping framework
│   ├── Selenium/Playwright for JavaScript rendering
│   ├── Distributed task queue (Celery + Redis)
│   └── Database abstraction layer (SQLAlchemy)
├── Services
│   ├── Job Management Service
│   ├── Instance Management Service
│   ├── Rate Limiting Service
│   ├── Data Processing Service
│   └── Monitoring Service
├── AWS Integration
│   ├── EC2 instance management
│   ├── SQS for job queuing
│   ├── S3 for data storage
│   └── CloudWatch for monitoring
└── API Layer
    ├── REST API (FastAPI)
    ├── WebSocket for real-time updates
    └── Authentication & authorization
```

### Frontend (React/TypeScript)
```
├── Dashboard Components
│   ├── Real-time metrics display
│   ├── Job status monitoring
│   ├── Instance health dashboard
│   └── Data visualization charts
├── Management Interfaces
│   ├── Job creation wizard
│   ├── Target URL management
│   ├── Scraping rule builder
│   └── Instance configuration
├── Data Explorer
│   ├── Search and filter scraped data
│   ├── Export functionality
│   └── Data quality metrics
└── Settings & Configuration
    ├── Rate limiting configuration
    ├── Robots.txt policy settings
    ├── Proxy management
    └── Alert configuration
```

## Dashboard Layout Specifications

### 1. Main Dashboard
- **Header**: Navigation bar with user info, notifications, and quick actions
- **Metrics Row**: Cards showing active jobs, success rate, data scraped today, instances running
- **Center Panel**: Real-time job status table with progress bars and ETA
- **Side Panel**: Recent alerts, system health, and quick stats
- **Footer**: System status indicators and last update timestamp

### 2. Job Management Interface
- **Job Creation Wizard**: Step-by-step process for setting up scraping jobs
- **Job Templates**: Pre-configured templates for common scraping scenarios
- **Scheduling Interface**: Cron-like scheduler with visual calendar
- **Bulk Operations**: Start/stop/modify multiple jobs simultaneously
- **Job History**: Detailed logs and performance metrics for completed jobs

### 3. Target Management
- **URL Discovery**: Tools to find and analyze target URLs
- **Rule Builder**: Visual interface for creating extraction rules
- **Testing Sandbox**: Preview scraping results before running full jobs
- **Blacklist Management**: Manage domains and URLs to avoid
- **Performance Analytics**: Success rates and performance metrics per target

### 4. Instance Management
- **Instance Grid**: Visual representation of all EC2 instances with status
- **Auto-scaling Configuration**: Set rules for automatic instance scaling
- **Geographic Distribution**: Map view showing instance locations
- **Performance Monitoring**: CPU, memory, and network usage per instance
- **Cost Tracking**: Real-time cost monitoring and optimization suggestions

## Key Features to Implement

### Smart Scraping Engine
1. **Content Type Detection**: Automatically detect and handle different content types
2. **Form Interaction**: Handle login forms, search forms, and multi-step processes
3. **Captcha Handling**: Integration with captcha-solving services
4. **Data Validation**: Real-time validation of scraped data quality
5. **Duplicate Detection**: Intelligent duplicate content identification

### Advanced Anti-Detection
1. **Browser Fingerprinting**: Rotate and randomize browser fingerprints
2. **Proxy Management**: Automatic proxy rotation with health checking
3. **Request Spacing**: Intelligent timing based on website behavior analysis
4. **Header Spoofing**: Realistic header generation based on real browser patterns
5. **Cookie Management**: Maintain realistic session cookies

### Data Management
1. **Real-time Processing**: Stream processing of scraped data
2. **Data Enrichment**: Automatic data cleaning and enhancement
3. **Export Options**: Multiple formats (JSON, CSV, XML, API)
4. **Data Lineage**: Track data sources and transformations
5. **Quality Metrics**: Automated data quality scoring

### Monitoring & Alerting
1. **Real-time Dashboards**: Live monitoring of all system components
2. **Custom Alerts**: Configurable alerts for various conditions
3. **Performance Analytics**: Detailed performance and efficiency reports
4. **Error Tracking**: Comprehensive error logging and analysis
5. **Capacity Planning**: Predictive analytics for resource planning

## Scalability Considerations

### Horizontal Scaling
- **Microservices Architecture**: Independent scaling of different components
- **Database Sharding**: Distribute data across multiple databases
- **CDN Integration**: Cache static content and API responses
- **Load Balancing**: Distribute traffic across multiple application instances

### Performance Optimization
- **Caching Strategy**: Multi-level caching (Redis, database, application)
- **Connection Pooling**: Efficient database and HTTP connection management
- **Async Processing**: Non-blocking I/O for all network operations
- **Batch Processing**: Group similar operations for efficiency

### Cost Optimization
- **Spot Instance Usage**: Use AWS spot instances for cost reduction
- **Intelligent Scheduling**: Schedule jobs during off-peak hours
- **Resource Right-sizing**: Automatic instance size optimization
- **Data Lifecycle Management**: Automatic data archiving and cleanup

## Security & Compliance

### Data Protection
- **Encryption**: End-to-end encryption for all data
- **Access Control**: Role-based access control (RBAC)
- **Audit Logging**: Comprehensive audit trails
- **Data Anonymization**: Options for sensitive data handling

### Legal Compliance
- **Terms of Service Compliance**: Automated ToS checking and compliance
- **GDPR Compliance**: Data protection and user rights management
- **Rate Limiting Transparency**: Clear documentation of scraping behavior
- **Respectful Scraping**: Built-in ethical scraping guidelines

## Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-3)
- Set up basic scraping engine with Scrapy
- Implement basic EC2 instance management
- Create simple job queue system
- Build basic dashboard with job monitoring

### Phase 2: Advanced Features (Weeks 4-6)
- Add JavaScript rendering capabilities
- Implement intelligent rate limiting
- Build robots.txt handling system
- Add proxy rotation and anti-detection features

### Phase 3: Scaling & Optimization (Weeks 7-9)
- Implement distributed architecture
- Add auto-scaling capabilities
- Build advanced monitoring and alerting
- Optimize performance and cost

### Phase 4: Polish & Enhancement (Weeks 10-12)
- Add advanced data processing features
- Implement comprehensive security measures
- Build advanced analytics and reporting
- Add API integrations and webhooks

## Success Metrics

### Performance Metrics
- **Throughput**: Pages scraped per minute/hour
- **Success Rate**: Percentage of successful scraping attempts
- **Response Time**: Average time to complete scraping jobs
- **Resource Efficiency**: Cost per page scraped

### Quality Metrics
- **Data Accuracy**: Percentage of correctly extracted data
- **Coverage**: Percentage of target content successfully accessed
- **Freshness**: How up-to-date the scraped data is
- **Completeness**: Percentage of required fields successfully extracted

### Operational Metrics
- **Uptime**: System availability percentage
- **Error Rate**: Percentage of failed operations
- **Detection Rate**: How often scraping is detected/blocked
- **Cost Efficiency**: Total cost per unit of data scraped

## Getting Started

1. **Environment Setup**: Set up AWS account and development environment
2. **Repository Structure**: Create organized code structure with proper documentation
3. **CI/CD Pipeline**: Set up automated testing and deployment
4. **Monitoring Setup**: Implement logging and monitoring from day one
5. **Documentation**: Maintain comprehensive documentation throughout development

This application should prioritize ethical scraping practices while providing powerful capabilities for legitimate data collection needs. The architecture should be modular, allowing for easy extension and customization based on specific use cases.
