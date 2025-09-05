# Security Policy

## Supported Versions

We are committed to providing security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| 0.9.x   | :x:                |
| 0.8.x   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **DO NOT** create a public GitHub issue

Security vulnerabilities should be reported privately to prevent potential exploitation.

### 2. Email us directly

Send a detailed report to: **security@savedfeast.com**

### 3. Include the following information in your report:

- **Description**: Clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: Potential impact of the vulnerability
- **Environment**: Device, OS, app version where the issue was found
- **Proof of Concept**: If possible, include a proof of concept
- **Suggested Fix**: If you have suggestions for fixing the issue

### 4. What to expect:

- **Initial Response**: Within 24-48 hours
- **Status Updates**: Regular updates on the progress
- **Resolution**: Public disclosure after the fix is deployed
- **Credit**: Recognition in our security acknowledgments (if desired)

## Security Best Practices

### For Users:

- Keep the app updated to the latest version
- Use strong, unique passwords
- Enable two-factor authentication when available
- Be cautious of phishing attempts
- Report suspicious activity immediately

### For Developers:

- Follow secure coding practices
- Use HTTPS for all API communications
- Implement proper input validation
- Use secure storage for sensitive data
- Regular security audits and updates

## Security Features

### Authentication & Authorization:

- Token-based authentication with Laravel Sanctum
- Secure token storage using Expo SecureStore
- Automatic token refresh
- Role-based access control

### Data Protection:

- Encrypted storage for sensitive data
- Secure API communication
- Input validation and sanitization
- Rate limiting on API endpoints

### Network Security:

- HTTPS enforcement
- Certificate pinning (planned)
- Secure WebSocket connections
- CORS protection

## Vulnerability Disclosure Timeline

| Action            | Timeline             |
| ----------------- | -------------------- |
| Initial Response  | 24-48 hours          |
| Status Update     | 1 week               |
| Fix Development   | 2-4 weeks            |
| Fix Deployment    | 1 week               |
| Public Disclosure | After fix deployment |

## Security Acknowledgments

We would like to thank the following security researchers for their contributions:

- [Security Researcher Name] - [Vulnerability Description]
- [Security Researcher Name] - [Vulnerability Description]

## Security Updates

### Recent Security Fixes:

- **v1.0.1**: Fixed token storage vulnerability
- **v1.0.0**: Initial security audit and fixes

### Upcoming Security Features:

- Certificate pinning implementation
- Biometric authentication support
- Enhanced encryption for local storage
- Advanced threat detection

## Contact Information

- **Security Email**: security@savedfeast.com
- **PGP Key**: [Available upon request]
- **Security Team**: security@savedfeast.com

## Responsible Disclosure

We follow responsible disclosure practices:

1. **Private Reporting**: Vulnerabilities are reported privately
2. **Timely Response**: We respond to reports within 24-48 hours
3. **Collaborative Fixing**: We work with reporters to develop fixes
4. **Public Disclosure**: We disclose issues after fixes are deployed
5. **Credit Recognition**: We credit security researchers appropriately

## Bug Bounty Program

We are currently developing a bug bounty program. Details will be announced soon.

---

**Thank you for helping keep SavedFeast Mobile App secure!** 🔒
