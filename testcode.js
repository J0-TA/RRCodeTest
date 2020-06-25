// The objetive as simple as writing a function that recives an integer `n` and return an array from `1` to `n` where:

// - Multiples of 3 have been replaced with `Fizz`
// - Multiples of 5 have been replaced with `Buzz`
// - Multiples of both have been replaced with `FizzBuzz`

// fizzBuzzToN(0) // => []
// fizzBuzzToN(5) // => [1,2,'Fizz', 4, 'Buzz']
// fizzBuzzToN(15) // => [1,2,'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz']


// 1 - For loop


// const fizzBuzzToN = n => {
//     const output = [];

//     for (let i = 1; i <= n; i++) {
//         if (i % 3 === 0 && i % 5 === 0) {
//             output.push(`FizzBuzz`)
//         } else if (i % 3 === 0) {
//             output.push(`Fizz`)
//         } else if (i % 5 === 0) {
//             output.push(`Buzz`)
//         } else {
//             output.push(i)
//         }
//     }

//     return output
// }


// 2 - .map function


// const fizzBuzzToN = n => {
//     const result = new Array(n).fill(0)
//     .map((item, index) => {
//         const i = index + 1
//         if (i % 3 === 0 && i % 5 === 0) {
//             return `FizzBuzz`;
//         } else if (i % 3 === 0) {
//             return `Fizz`;
//         } else if (i % 5 === 0) {
//             return `Buzz`;
//         } else {
//             return i;
//         }
//     })

//     return result;
// };




// 3 - .map + checkMultiples Function


const checkMultiples = (number) => {
    if (number % 3 === 0 && number % 5 === 0) {
        return `FizzBuzz`;
    } else if (number % 3 === 0) {
        return `Fizz`;
    } else if (number % 5 === 0) {
        return `Buzz`;
    } else {
        return number;
    };
};

const fizzBuzzToN = n => {
    return new Array(n).fill()
    .map((_,idx)=> checkMultiples(idx+1))
}

fizzBuzzToN(15);

// Given a function receiving an array of integers and an integer, return if there is a couple of elements in the array which sum is equal to the number given

const numbersToCache = array => {
    const cachedNumbers = {}
    array.forEach((number, idx) => cachedNumbers[number] = idx)

    return cachedNumbers
}

const hasSumEqualTo = (array, target) => {
    
    const cachedNumbers = numbersToCache(array)
   
    let hasSum = false    
    
    array.forEach((number, idx) => {
        if (cachedNumbers[target - number] !== undefined && cachedNumbers[target - number] !== idx) hasSum = true;
    })

    return hasSum
}

hasSumEqualTo([1, 3, 4, 6], 9)