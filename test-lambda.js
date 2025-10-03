const handler = require('./lambda/index').handler;

// Simple test event for LaunchRequest
const testEvent = {
    "version": "1.0",
    "session": {
        "new": true,
        "sessionId": "test-session",
        "application": {
            "applicationId": "test-app-id"
        },
        "user": {
            "userId": "test-user-id"
        }
    },
    "context": {
        "System": {
            "application": {
                "applicationId": "test-app-id"
            },
            "user": {
                "userId": "test-user-id"
            },
            "device": {
                "supportedInterfaces": {}
            }
        }
    },
    "request": {
        "type": "LaunchRequest",
        "requestId": "test-request-id",
        "timestamp": "2024-01-01T00:00:00Z",
        "locale": "en-US"
    }
};

// Mock context
const context = {
    succeed: (response) => {
        console.log('SUCCESS:', JSON.stringify(response, null, 2));
    },
    fail: (error) => {
        console.log('ERROR:', error);
    }
};

// Test the handler
console.log('Testing Lambda function...');
try {
    handler(testEvent, context);
} catch (error) {
    console.error('Test failed:', error);
}