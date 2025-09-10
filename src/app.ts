const loggerResult = document.querySelector('#list');

function Logger(logString: string) {
  createLogs('Log Factory')
  return (constructor: Function) => {
    createLogs(`Logger String: ${logString}`);
    createLogs(`Constructor Logger: ${constructor.toString()}`);
  };
}

function WithTemplate(template: string, hookId: string) {
  createLogs('Template Factory');
  return function <T extends { new(...args: any[]): { name: string } }>(
    originalConstructor: T
  ) {
    return class extends originalConstructor {
      constructor(..._: any[]) {
        super();
        createLogs('Rendering template');
        const hookEl = document.getElementById(hookId);
        if (hookEl) {
          hookEl.innerHTML = template;
          hookEl.querySelector('h1')!.textContent = this.name;
        }
      }
    };
  };
}

// @Logger('LOGGING - PERSON')
@Logger('LOGGING')
@WithTemplate('<h1>My Person Object</h1>', 'app')
class Person {
  name = 'Name String';

  constructor() {
    createLogs('Constructor: Creating person object...');
  }
}

const pers = new Person();
createLogs(`Person: ${JSON.stringify(pers)}`);

function Log(target: any, propertyName: string | Symbol) {
  createLogs('Property decorator!');
  createLogs(`Target: ${JSON.stringify(target)}`);
  createLogs(`Property Name: ${propertyName}`);
}

function Log2(target: any, name: string, descriptor: PropertyDescriptor) {
  createLogs('Accessor decorator Log2!');
  createLogs(`Target Log2: ${JSON.stringify(target)}`);
  createLogs(`Name Log2: ${name}`);
  createLogs(`Property Descriptor Log2: ${JSON.stringify(descriptor)}`);
}

function Log3(
  target: any,
  name: string | Symbol,
  descriptor: PropertyDescriptor
) {
  createLogs('Method decorator Log3!');
  createLogs(`Target Log3: ${JSON.stringify(target)}`);
  createLogs(`Name Log3: ${name.toString()}`);
  createLogs(`Property Descriptor Log3: ${JSON.stringify(descriptor)}`);
}

function Log4(target: any, name: string | Symbol, position: number) {
  createLogs('Parameter decorator Log4!');
  createLogs(`Target Log4: ${JSON.stringify(target)}`);
  createLogs(`Name Log4: ${name.toString()}`);
  createLogs(`Position Log4: ${position}`);
}

class Product {
  @Log
  title: string;
  private _price: number;

  @Log2
  set price(val: number) {
    if (val > 0) {
      this._price = val;
    } else {
      throw new Error('Invalid price - should be positive!');
    }
  }

  constructor(t: string, p: number) {
    this.title = t;
    this._price = p;
  }

  @Log3
  getPriceWithTax(@Log4 tax: number) {
    return this._price * (1 + tax);
  }
}

const p1 = new Product('Book', 19);
const p2 = new Product('Book 2', 29);

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjDescriptor;
}

class Printer {
  message = 'This works!';

  @Autobind
  showMessage() {
    createLogs(`Message Printer: ${this.message}`);
  }
}

const p = new Printer();
p.showMessage();

const button = document.querySelector('button')!;
button.addEventListener('click', p.showMessage);

// ---

interface ValidatorConfig {
  [property: string]: {
    [validatableProp: string]: string[]; // ['required', 'positive']
  };
}
const registeredValidators: ValidatorConfig = {};
function Required(target: any, propName: string) {
  registeredValidators[target.constructor.name] = {
    ...registeredValidators[target.constructor.name],
    [propName]: ['required']
  };
}

function PositiveNumber(target: any, propName: string) {
  registeredValidators[target.constructor.name] = {
    ...registeredValidators[target.constructor.name],
    [propName]: ['positive']
  };
}

function validate(obj: any) {
  const objValidatorConfig = registeredValidators[obj.constructor.name];
  if (!objValidatorConfig) {
    return true;
  }
  let isValid = true;
  for (const prop in objValidatorConfig) {
    for (const validator of objValidatorConfig[prop]) {
      switch (validator) {
        case 'required':
          isValid = isValid && !!obj[prop];
          break;
        case 'positive':
          isValid = isValid && obj[prop] > 0;
          break;
      }
    }
  }
  return isValid;
}

class Course {
  @Required
  title: string;
  @PositiveNumber
  price: number;

  constructor(t: string, p: number) {
    this.title = t;
    this.price = p;
  }
}

const courseForm = document.querySelector('form')!;
courseForm.addEventListener('submit', event => {
  event.preventDefault();
  const titleEl = document.getElementById('title') as HTMLInputElement;
  const priceEl = document.getElementById('price') as HTMLInputElement;

  const title = titleEl.value;
  const price = +priceEl.value;

  const createdCourse = new Course(title, price);

  if (!validate(createdCourse)) {
    createLogs('Submit: Invalid input, please try again!');
    return;
  }
  createLogs(`Submit: ${JSON.stringify(createdCourse)}`);
});

function createLogs(logString: string) {
  const li = document.createElement('li');
  const timeStamp = `${getTimeStamp()}`;
  li.textContent = `${timeStamp} - ${logString}`;
  loggerResult?.appendChild(li);
}

function getTimeStamp() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const formatted = `${day}-${month}-${year} ${hours}:${minutes}`;
  return formatted;
}