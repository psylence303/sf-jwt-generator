# SalesForce JWT generator

Generates a JWT using the provided config. Then it's your part to use this JWT to retrieve the actual token from SF OAuth.

## Installation

```bash
yarn
```

## Configuration

The configuration has the following properties (all of them except the offsetInMs are mandatory):

```js
const config = {
    clientId: '<YOUR CLIENT ID HERE>',
    offsetInMs: '<HOW MANY MILLISECONDS THE TOKEN IS VALID (OPTIONAL, DEFAULT IS 1 DAY)',
    privateKey: '<YOUR PRIVATE KEY AS UTF-8 STRING>',
    url: '<SALESFORCE BASE URL>',
    username: '<YOUR SALESFORCE USERNAME>'
}
```

The url should be one of:

```
https://login.salesforce.com
https://test.salesforce.com
```

## Usage

```js
import {generateJwt} from 'sf-jwt-generator';

const jwt = generateJwt(config); // the config provided above
```

To import the config type definition in TypeScript:

```ts
import {ConnectionConfig} from 'sf-jwt-generator';

const config:ConnectionConfig = {
    // config here
}
```
