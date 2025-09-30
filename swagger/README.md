# Swagger Documentation Setup

This folder contains the Swagger documentation configuration for the Node.js API project.

## Files

- `swagger.js` - Main Swagger configuration file
- `README.md` - This documentation file

## How to Use

1. Start your Node.js server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:4500/api-docs
   ```
   or
   ```
   http://localhost:5500/api-docs
   ```

3. The Swagger UI will display all your API endpoints with:
   - Request/response schemas
   - Parameter descriptions
   - Example requests
   - Interactive testing capabilities

## Features

- **Interactive API Testing**: Test endpoints directly from the documentation
- **Request/Response Schemas**: Detailed information about data structures
- **Authentication**: Bearer token authentication support
- **File Upload**: Support for multipart/form-data endpoints
- **Search and Filter**: Easy navigation through API endpoints

## API Endpoints Documented

All user-related endpoints are documented including:
- User registration and login
- Profile management
- Password operations
- File uploads
- User search and management

## Customization

To modify the documentation:
1. Edit the `swagger.js` file for global configuration
2. Update JSDoc comments in route files for endpoint-specific documentation
3. Restart the server to see changes

## Dependencies

- `swagger-jsdoc`: Generates OpenAPI specification from JSDoc comments
- `swagger-ui-express`: Serves Swagger UI interface
