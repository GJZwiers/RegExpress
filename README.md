Regexpress creates regex patterns from data using template strings. Templates can be 
specified in a settings object and accompanied by a data object.

Usage:

```javascript
import { Reno } from 'reno';

const reno = new Regexpress();
```

```javascript
const regexData = {
    volume: '\\d{1,4}',
    unit: ['ml', 'cl', 'l']
};

const settings = {
    template: '(volume) (unit)',
    flags: 'i'
};

const regex = rxp.buildRegex(regexData, settings);
```
The above builds the pattern: ```/(\d{1,4}) (ml|cl|l)/i``` in the following steps:
 * Arrays of strings are joined with pipe symbols by default
to create alternates:
```javascript
['ml', 'cl', 'l'] -> 'ml|cl|l'
```
* The values are inserted into the regex group in the template string:
```javascript
'(volume) (unit)' -> '(\\d{1,4}) (unit)'
'(\\d{1,4}) (unit)' -> '(\\d{1,4}) (ml|cl|l)'
```
* The string is then compiled to regex 
with the specified flag(s):
```javascript
'(\\d{1,4}) (ml|cl|l)' -> /(\d{1,4}) (ml|cl|l)/i
```

A custom separator can be defined by adding a separator field to the settings:

```javascript
const regexData = {
    keywords: ['one', 'two', 'three']
};

const settings = {
    template: 'keywords',
    flags: '',
    separator: '.+'
};

const regex = rxp.buildRegex(regexData, settings); -> /one.+two.+three/
```

Regexpress can be helpful in scenarios where you want to match data coming in a high variety of different notations but with similar meaning. Suppose you want to match volume data which can come as either a single value, a min-max range or a limit value (e.g. > 100). With Regexpress you can declare a list of templates for each of these:

 ```javascript
    const settings = {
            templateList: [
            '(volume) (unit)[- ]+(volume) (unit)',  // Range
            '[>< ]+(volume) (unit)',                // Limit
            '(volume) (unit)',                      // Single
            ],
            flags: 'i'
    };

    const regexData = {
        volume: '\\d{1,4}',
        unit: ['ml', 'cl', 'l'],
    };

    const regexes = rxp.buildRegexes(regexData, settings);

    /* 
    Will build array of patterns: [
        /(\d{1,4})(ml|cl|l)[- ]+(\d{1,4})(ml|cl|l)/i,
        /[>< ]+(\d{1,4})(ml|cl|l)/i,
        /(\d{1,4})(ml|cl|l)/i 
    ] 
    */
```

Patterns built using Regexpress contain the template string as a property, which can be used to map the matches array to an object with the named groups being the keys:

```javascript
const volumeData = '100 ml';
// regex: /(\d{1,4}) (ml|cl|l)/i, template: '(volume) (unit)'
const matches = volumeData.match(regex);
// matches: [ '100 ml', '100', 'ml']
const map = rxp.mapTemplate(matches, regex.getTemplate()); 
// map: { fullMatch: '100 ml', volume: '100', unit: 'ml' }
```

You can reuse regex groups in a number of patterns by declaring them in a separate object and adding placeholders in the regex data. They can also be used when you want to have similar groups but want to name them differently:

The example below reuses components for day, month and year in both an expiry date as well as a calendar date:

 ```javascript
    import { Regexpress } from 'regexpress';

    const substitutes = {
        day: '[0-3][0-9]',
        month:  ['jan','feb','mar','apr','may','jun',
                'jul','aug','sep','okt','nov','dec'],
        year: '(?:19|20)\\d{2}'
    }
    
    const productExpirationDate = {
        expire_statement: ['best before', 'best quality up until', 'use before'],
        day: '~~day~~',
        month: '~~month~~',
        year: '~~year~~'
    }
    
    const ExpirationDateSettings = {
        template: '(?:expire_statement): (day)-(month)-(year)',
        flags: ''
    }
    
    const calendarDate = {
        day: '~~day~~',
        month: '~~month~~',
        year: '~~year~~'
    }
    
    const calendarDateSettings = {
        templateList: [
        '(day)-(month)-(year)',
        '(month)-(day)-(year)'
        ],
        flags: ''
    }

```

