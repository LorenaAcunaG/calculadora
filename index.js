const display = document.getElementById('display');
const displayHistory = document.getElementById('history');
const displayExpression = display.children[0]; //En este elemento se imprime lo que el usuario ingresa
const displayResult = display.children[1]; //En este elemento se imprime el resultado que devuelve la función result()
const keys = document.getElementsByClassName('key');
let history = [];
let expression = "";
let validExpression = false;
let lastExpression = "";
let number = "";

//Si existe un historial en Local Storage, se carga en arreglo history
getHistory();

//Botones/teclas clasificadas en grupos 
const actions = ["Enter","Backspace","Delete"];
const numbers = ["0","1","2","3","4","5","6","7","8","9","."];
const operators = ["/","*","-","+","%","(",")","×","÷"];

//Agrega eventos a los botones para interactuar con la calculadora
Array.from(keys).forEach((key) => {
    key.addEventListener('click', () => calculate(key.value));
    key.addEventListener('mouseover', () => key.style.borderRadius = borderRadiusRandom());
    key.addEventListener('mouseleave', () => key.style.borderRadius = '50%');
});

//Escucha pulsaciones en el teclado del dispositivo
document.addEventListener("keyup", event => {
    const buttonKey = document.getElementById(`${event.key}`);
    buttonKey.style.borderRadius = borderRadiusRandom();
    buttonKey.style.scale = "1.09";
    buttonKey.style.filter = "brightness(0.9)";
    setTimeout(() => {
        buttonKey.style.borderRadius = '50%';
        buttonKey.style.scale = "1";
        buttonKey.style.filter = "brightness(1)";
    },200)
    calculate(event.key);
});

//Devuelve valor random para border-radius (fectos visuales)
function borderRadiusRandom(){
    let values = "";
    for(i = 1; i < 5; i++){
        values += `${Math.floor(Math.random() * 61) + 40}px `;
    }
    return values;
}

//Función rpincipal realizar los cálculos
function calculate(key){
    expression === "0" ? expression = "" : null;
    let group;
    actions.includes(`${key}`) ? group = "actions" : null;
    numbers.includes(`${key}`) ? group = "numbers" : null;
    operators.includes(`${key}`) ? group = "operators" : null;

    switch (group) {
        case "numbers": //Cuando se ingresan números
            number == "" ? lastExpression = expression : null;
            number = getLastNumbers(expression); //Identifica si al final de la expresión hay un grupo de números y los almacena en "number"
            number += key;
            expression = lastExpression + milesSeparator(number); //Concatena la expresión y el nuevo grupo de número separado por miles.
            validExpression = true;
            break;
        case "operators":
            number = "";
            lastExpression = "";
            if(key === '(' || key === ')'){ //Cuando se ingresan paréntesis
                expression += parentheses(expression); //Agrega el valor de paréntesis a la expresión
                break;
            }
            const lastCharacter = expression[expression.length - 1];
            if((expression !== "" && lastCharacter !== "(" && lastCharacter !== "-") && key !== "-"){  // Previene el ingreso de dos operadores contiguos o cuando el último caracter es "(" ó "-"
                const lastCharacter = expression[expression.length-1];
                if(operators.includes(`${lastCharacter}`) && lastCharacter !== "(" && lastCharacter !== ")"){
                    expression = expression.slice(0, -1) + key;
                } else {
                    expression += key; //Agrega el valor de botón/tecla a la expresión
                }
                expression = expression.replace("*", "×"); // Formatea la expresión para mostrar al usuario
                expression = expression.replace("/", "÷"); // Formatea la expresión para mostrar al usuario
                validExpression = false;
                break;
            } else if(key === "-" && expression !== "-"){ //Permite ingreso de "-" como primer caracter
                expression += key; //Agrega el valor de botón/tecla a la expresión
                validExpression = false;
                break;
            }
        case "actions":
            if(key === "Delete"){ //Borra todos los caracteres
                lastExpression = "";
                number = "";
                expression = "0";
                break;
            }
            if(key === "Backspace"){ //Borra el último caracter
                expression = expression.replaceAll(",", "");
                expression = expression.toString().slice(0, -1);
                expression =  milesSeparator(expression); //Recalcula la separación de miles
            }
            if(key === "Enter" && validExpression){ //Trae el resultado de la expresión
                lastExpression = "";
                number = "";
                expression = result(expression, true); //Reemplaza la expresión por el resultado
            }
            break;
    }
    number = getLastNumbers(expression); //Identifica si al final de la expresión hay un grupo de números y los almacena en "number"
    expression === "" ? expression = "0" : null; //Si la expresión quedó vacía, le asigna un cero para mostrar al usuario
    if(result(expression) !== "Error"){
        displayResult.innerText = result(expression); //Si no hay errores, muestra el resultado
    }
    displayExpression.value = expression;
    displayExpression.scrollLeft = display.scrollWidth;
}

//Función para el manejo de paréntesis en la expresión
function parentheses(expression){
    const countOpen = expression.split("(").length-1;
    const countClosed = expression.split(")").length-1;
    const lastCharacter = expression[expression.length-1];
    if((!operators.includes(`${lastCharacter}`) || lastCharacter === ")") && countOpen > countClosed){
        validExpression = true;
        return ")";
    }
    return "(";
}

//Función principal realizar los cálculos
function result(expression, save = false){
    //getHistory(); //descarga el historial desde Local Storage y lo muestra en pantalla
    try{
        if(!expression) return "";
        const expressionUser = expression;
        expression = expression
        .replaceAll(",", "")
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll(/(\d+)\%/g, "($1/100)") // num% => num/100
        .replaceAll(/\)\(/g, ")*(") // ...)(... => ...)*(...
        .replaceAll(/\((.*?)\)(\d)/g, "($1)*$2") // (expresión)num => (expresión)*num
        .replaceAll(/(\d)\((.*?)\)/g, "$1*($2)") // num(expresión) => num*(expresión)

        if(save){
            const prueba = [...history];
            console.log(prueba);
            history.unshift({
                "expression": expressionUser,
                "result": milesSeparator(eval(expression).toString())
            })
            localStorage.setItem("history", JSON.stringify(history));
            validExpression = false;
            getHistory();
        }

        return milesSeparator(eval(expression).toString());
    } catch (err){
        if(err) return "Error";
    }
}

//Función para separar un número en miles
function milesSeparator(number) {
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Función que identifica si al final de la expresión hay un grupo de números y lo retorna
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

//Función que trae el historial desde Local Storage
function getHistory(){
    const historyFromLS = localStorage.getItem("history");
    if(historyFromLS !== null && historyFromLS !== undefined){
        displayHistory.style.display = 'flex'
        history = JSON.parse(historyFromLS);
        updateHistory();
    } else {
        displayHistory.style.display = 'none'
    }
}

function updateHistory(){
    displayHistory.innerHTML = "";
    let i = history.length;
    history.forEach((el) => {
        let h = document.createElement("div");
        h.classList.add('item');
        h.innerHTML = `
            <input type="text" readonly class="expression" value="${el.expression}">
            <span class="result">${el.result}</span>
            <span class="index">${i}</span>
        `;
        displayHistory.appendChild(h);
        i--
    })
    
    const allItems = displayHistory.getElementsByClassName('item');
    Array.from(allItems).forEach((item) => {
        item.children[0].scrollLeft = item.children[0].scrollWidth;
        item.addEventListener('click', () => {
            readHistoryItem(item);
        });
    });
}

function readHistoryItem(item){
    expression = item.children[0].value;
    displayExpression.value = expression;
    displayExpression.scrollLeft = display.scrollWidth;
    displayResult.innerText = item.children[1].innerText;
    validExpression = false;
}