# Contributing to Thermostat Web-Client

This guide provides an introduction and some tips for developing Thermostat Web-Client

## Style

### General Code Style
* License header goes at the top of every file
* Indent with 2 spaces instead of tabs
* Avoid trailing spaces
* See .eslintrc.yaml for more details

### AngularJS
* ECMAScript 2015 (ES6) Language Specification
* Fat Arrow Functions where possible
````
let fooFunction = (param1, ..., paramN) => { ... };
````
* One space between function names and parameters
````
function fooFunction () { ... }
````
* If more than one, module dependencies and attributes should be listed one per line
````
angular
  .module('fooModule', [
    dependencyA,
    dependencyB,
    ...
  ])
  .controller('FooController', FooController);
````
### Testing
* Every component foo.js should have an associated foo.spec.js file
* The spec file should be located in the same folder as the file it's testing
* Tests are run using the Mocha test framework & Karma test runner 
* describe() should write the name of the code being tested
````
describe('FooController', () => { ... });
````
* it() should describe the expected behaviour of the unit test
````
it('should export constant ...', () => { ... });
````
## Naming Conventions
Controllers
* PascalCase
* Component + 'Controller'
* e.g., AppController

Directives
* lowerCamelCase
* e.g., customizableErrorMessageDirective

Factories
* lowerCamelCase
* eg., authInterceptorFactory

Filters
* lowerCamelCase
* These will have 'Filter' appended to their names
* i.e., bigIntToDate will become bigIntToDateFilter

Modules
* lowerCamelCase
* component + 'Module'
* e.g., appModule

Routers
* lowerCamelCase
* e.g., appRouter

Router States
* lowerCamelCase
* Should be named after the url it will be reaching
* e.g., jvmList will be the state for /jvm-list

Services
* lowerCamelCase
* e.g., bigIntToDateService
