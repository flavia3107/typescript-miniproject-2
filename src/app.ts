const loggerResult = document.querySelector('#list');

function Logger(logString: string) {
  createLogs('Log Factory')
  return (constructor: Function) => {
    createLogs({ label: 'Logger String', value: logString });
    createLogs({ label: 'Constructor Logger', value: constructor });
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
  name = 'Person Name';

  constructor() {
    createLogs('Constructor: Creating person object...');
  }
}

const pers = new Person();
createLogs({ label: 'Person', value: pers });

function Log(target: any, propertyName: string | Symbol) {
  createLogs('Property decorator!');
  createLogs({ label: 'Target', value: target });
  createLogs({ label: 'Property Name', value: propertyName });
}

function Log2(target: any, name: string, descriptor: PropertyDescriptor) {
  createLogs('Accessor decorator Log2!');
  createLogs({ label: 'Target Log2', value: target });
  createLogs({ label: 'Name Log2', value: name });
  createLogs({ label: 'Property Descriptor Log2', value: descriptor });
}

function Log3(
  target: any,
  name: string | Symbol,
  descriptor: PropertyDescriptor
) {
  createLogs('Method decorator Log3!');
  createLogs({ label: 'Target Log3', value: target });
  createLogs({ label: 'Name Log3', value: name });
  createLogs({ label: 'Property Descriptor Log3', value: descriptor });
}

function Log4(target: any, name: string | Symbol, position: number) {
  createLogs('Parameter decorator Log4!');
  createLogs({ label: 'Target Log4', value: target });
  createLogs({ label: 'Name Log4', value: name });
  createLogs({ label: 'Position Log4', value: position });
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
      createLogs('Product Price: Invalid price - should be positive!');
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
    createLogs({ label: 'Message Printer', value: this.message });
  }
}

const p = new Printer();
p.showMessage();

const button = document.querySelector('#message-button')!;
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
    createLogs({ label: 'Submit: Invalid input, please try again!', value: createdCourse });
    return;
  }
  createLogs({ label: 'Submit', value: createdCourse });
});

function createLogs(log: string | object | { label: string; value: object }) {
  const li = document.createElement('li');
  const timeStamp = getTimeStamp();
  const timeSpan = document.createElement('span');
  timeSpan.textContent = `${timeStamp}`;
  const container = document.createElement('div');
  container.className = 'details-container';

  if (typeof log === 'object') {
    if ('label' in log && 'value' in log) {
      const labelSpan = document.createElement('span');
      labelSpan.textContent = `${log.label}: `;
      container.appendChild(labelSpan);

      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(log.value, null, 2);
      container.appendChild(pre);
    } else {
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(log, null, 2);
      container.appendChild(pre);
    }
  } else {
    const textNode = document.createTextNode(log);
    container.appendChild(textNode);
  }

  li.appendChild(container);
  li.appendChild(timeSpan);
  loggerResult?.appendChild(li);
}

function getTimeStamp() {
  const now = new Date();
  // const day = now.getDate();
  // const month = now.getMonth() + 1;
  // const year = now.getFullYear();
  const pad = (num: number) => num.toString().padStart(2, '0');
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const formatted = `${hours}:${minutes}:${seconds}`;
  return formatted;
}