const display = document.getElementById('display');
const displayExpression = display.children[0];
const displayResult = display.children[1];
const keys = document.getElementsByClassName('key');

let expression = "";
let lastExpression = "";
let number = "";

const actions = ["Enter","Backspace","Delete"];
const numbers = ["0","1","2","3","4","5","6","7","8","9","."];
const operators = ["/","*","-","+","%","(",")","×","÷"];

Array.from(keys).forEach((key) => {
    key.addEventListener('click', () => calculate(key.value));
    key.addEventListener('mouseover', () => key.style.borderRadius = borderRadiusRamdom());
    key.addEventListener('mouseleave', () => key.style.borderRadius = '50%');
});
document.addEventListener("keyup", event => {
    const buttonKey = document.getElementById(`${event.key}`);
    buttonKey.style.borderRadius = borderRadiusRamdom();
    buttonKey.style.scale = "1.09";
    buttonKey.style.filter = "brightness(0.9)";
    setTimeout(() => {
        buttonKey.style.borderRadius = '50%';
        buttonKey.style.scale = "1";
        buttonKey.style.filter = "brightness(1)";
    },200)
    calculate(event.key);
});

function borderRadiusRamdom(){
    let values = "";
    for(i = 1; i < 5; i++){
        values += `${Math.floor(Math.random() * 61) + 40}px `;
    }
    return values;
}

function calculate(key){
    expression === "0" ? expression = "" : null;
    let group;
    actions.includes(`${key}`) ? group = "actions" : null;
    numbers.includes(`${key}`) ? group = "numbers" : null;
    operators.includes(`${key}`) ? group = "operators" : null;

    switch (group) {
        case "numbers":
            number == "" ? lastExpression = expression : null;
            number = getLastNumbers(expression);
            number += key;
            expression = lastExpression + milesSeparator(number);
            break;
        case "operators":
            number = "";
            lastExpression = "";
            if(key === '(' || key === ')'){
                expression += parentheses(expression);
                break;
            }
            if((expression !== "" && expression !== "-") && key !== "-"){
                const lastCharacter = expression[expression.length-1];
                if(operators.includes(`${lastCharacter}`) && lastCharacter !== "(" && lastCharacter !== ")"){
                    expression = expression.slice(0, -1) + key;
                } else {
                    expression += key;
                }
                expression = expression.replace("*", "×");
                expression = expression.replace("/", "÷");
                break;
            } else if(key === "-" && expression !== "-"){
                expression += key;
                break;
            }
        case "actions":
            if(key === "Delete"){
                lastExpression = "";
                number = "";
                expression = "0";
                break;
            }
            if(key === "Backspace"){
                expression = expression.replaceAll(",", "");
                expression = expression.toString().slice(0, -1);
                expression =  milesSeparator(expression);
            }
            if(key === "Enter"){
                lastExpression = "";
                number = "";
                expression = result(expression);
            }
            break;
    }
    number = getLastNumbers(expression);
    expression === "" ? expression = "0" : null;
    if(result(expression) !== "Error"){
        displayResult.innerText = result(expression);
    }
    displayExpression.innerText = expression;
}

function parentheses(expression){
    const countOpen = expression.split("(").length-1;
    const countClosed = expression.split(")").length-1;
    const lastCharacter = expression[expression.length-1];
    if((!operators.includes(`${lastCharacter}`) || lastCharacter === ")") && countOpen > countClosed){
        return ")";
    }
    return "(";
}

function result(expression){
    try{
        if(!expression) return "";
        let expressionUser = expression;
        expression = expression
        .replaceAll(",", "")
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll(/(\d+)\%/g, "($1/100)") // num% => num/100
        .replaceAll(/\)\(/g, ")*(") // ...)(... => ...)*(...
        .replaceAll(/\((.*?)\)(\d)/g, "($1)*$2") // (expresión)num => (expresión)*num
        .replaceAll(/(\d)\((.*?)\)/g, "$1*($2)") // num(expresión) => num*(expresión)

        return milesSeparator(eval(expression).toString());
    } catch (err){
        if(err) return "Error";
    }
}

function milesSeparator(number) {
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getLastNumbers(expression){
    let newNumbers = "";
    if(expression !== ""){
        for(let i = expression.length - 1; i > -1 ;i--){
            if(isNaN(Number(expression[i])) && expression[i] !== ","){
                break
            } else if (!isNaN(Number(expression[i]))){
                newNumbers += expression[i]
            }
        }
        return newNumbers.split("").reverse().join("");
    } else return ""
}