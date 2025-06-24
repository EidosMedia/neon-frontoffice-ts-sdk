# Neon frontoffice typescript SDK

> A lightweight, framework-agnostic TypeScript library for interacting with **Eidosmedia Neon**'s "Front Office" end points.

This is the library for communicating with Neon front office services. It exposes APIs for backend communication and a suitable type system definition.

## About

This library provides an abstract and reusable set of functions to communicate directly with Eidosmedia Neon, enabling:

- Data retrieval and manipulation
- Authentication and session handling
- API-based operations and extensions

## Usage

This toolkit is designed to be **agnostic**, meaning it can be used in:

- Web applications (React, Vue, plain JS, etc.)
- Node.js environments
- Scripts and automation tools

## Compatibility

- ✅ Framework-independent
- ✅ Designed for server-side integrations

**Note:** For security reasons, this library must not be used for browser scripting.

## Disclaimer

This library is maintained in conjunction with the Eidosmedia Neon ecosystem and may evolve in parallel with its core APIs. Please validate compatibility before integrating it into production systems.
The certified compatible NEON versions that can be used are in src/conf/versions.ts file 

## License

This library is provided under the BSD-3-Clause license model for usages allowed by the license.

## Getting Started

Library initialization:

```javascript
import { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';

const connection = new NeonConnection();
```
