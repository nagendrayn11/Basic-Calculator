
const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");

const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");
const actionButtons = document.querySelectorAll("[data-action]");

let currentInput = "0";
let previousValue = null;
let currentOperator = null;
let shouldReset = false;
let expressionText = "";

// Update the calculator display
function updateDisplay() {
    resultDisplay.textContent = currentInput;
    expressionDisplay.textContent =
        expressionText || "Ready to calculate";

    operatorButtons.forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset.operator === currentOperator
        );
    });
}

// Format numbers without unnecessary decimal zeros
function formatNumber(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    if (number === 0) return "0";

    return Number(number.toPrecision(12)).toString();
}

// Enter a number
function enterNumber(number) {
    if (currentInput === "Error" || shouldReset) {
        currentInput = number;
        shouldReset = false;
    } else if (currentInput === "0") {
        currentInput = number;
    } else if (currentInput.replace("-", "").length < 15) {
        currentInput += number;
    }

    updateDisplay();
}

// Enter decimal point
function enterDecimal() {
    if (currentInput === "Error" || shouldReset) {
        currentInput = "0.";
        shouldReset = false;
    } else if (!currentInput.includes(".")) {
        currentInput += ".";
    }

    updateDisplay();
}

// Perform arithmetic
function calculate(a, b, operator) {
    switch (operator) {
        case "+":
            return a + b;

        case "-":
            return a - b;

        case "*":
            return a * b;

        case "/":
            return b === 0 ? NaN : a / b;

        default:
            return b;
    }
}

// Select an arithmetic operator
function chooseOperator(operator) {
    if (currentInput === "Error") {
        clearCalculator();
        return;
    }

    const inputValue = Number(currentInput);

    // Calculate previous operation first
    if (currentOperator && !shouldReset) {
        const answer = calculate(
            previousValue,
            inputValue,
            currentOperator
        );

        currentInput = formatNumber(answer);

        if (currentInput === "Error") {
            updateDisplay();
            clearCalculator();
            currentInput = "Error";
            updateDisplay();
            return;
        }

        previousValue = Number(currentInput);
    } else {
        previousValue = inputValue;
    }

    currentOperator = operator;
    expressionText =
        `${currentInput} ${getSymbol(operator)}`;

    shouldReset = true;
    updateDisplay();
}

// Display friendly operator symbols
function getSymbol(operator) {
    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return symbols[operator] || operator;
}

// Calculate final result
function showResult() {
    if (!currentOperator || shouldReset) return;

    const first = previousValue;
    const second = Number(currentInput);
    const operator = currentOperator;
    const answer = calculate(first, second, operator);

    expressionText =
        `${formatNumber(first)} ${getSymbol(operator)} ${formatNumber(second)} =`;

    currentInput = formatNumber(answer);

    previousValue = null;
    currentOperator = null;
    shouldReset = true;

    updateDisplay();
}

// Clear everything
function clearCalculator() {
    currentInput = "0";
    previousValue = null;
    currentOperator = null;
    shouldReset = false;
    expressionText = "";

    updateDisplay();
}

// Delete last digit
function deleteLastDigit() {
    if (currentInput === "Error" || shouldReset) {
        currentInput = "0";
        shouldReset = false;
    } else if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);

        if (currentInput === "-") {
            currentInput = "0";
        }
    } else {
        currentInput = "0";
    }

    updateDisplay();
}

// Percentage: 50 becomes 0.5
function calculatePercent() {
    if (currentInput === "Error") return;

    currentInput = formatNumber(Number(currentInput) / 100);
    shouldReset = true;

    updateDisplay();
}

// Change positive to negative and vice versa
function changeSign() {
    if (currentInput === "Error" || Number(currentInput) === 0) {
        return;
    }

    currentInput = currentInput.startsWith("-")
        ? currentInput.slice(1)
        : "-" + currentInput;

    updateDisplay();
}

// Number button events
numberButtons.forEach(button => {
    button.addEventListener("click", () => {
        enterNumber(button.dataset.number);
    });
});

// Operator button events
operatorButtons.forEach(button => {
    button.addEventListener("click", () => {
        chooseOperator(button.dataset.operator);
    });
});

// Other button events
actionButtons.forEach(button => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;

        switch (action) {
            case "clear":
                clearCalculator();
                break;

            case "delete":
                deleteLastDigit();
                break;

            case "decimal":
                enterDecimal();
                break;

            case "percent":
                calculatePercent();
                break;

            case "sign":
                changeSign();
                break;

            case "equals":
                showResult();
                break;
        }
    });
});

// Keyboard support
document.addEventListener("keydown", event => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        enterNumber(key);
    } else if (key === ".") {
        enterDecimal();
    } else if (["+", "-", "*", "/"].includes(key)) {
        chooseOperator(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        showResult();
    } else if (key === "Backspace") {
        deleteLastDigit();
    } else if (key === "Escape") {
        clearCalculator();
    } else if (key === "%") {
        calculatePercent();
    }
});

// Initial display
updateDisplay();
