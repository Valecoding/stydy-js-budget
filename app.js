/*
var budgetController = (function () {

    var x=23;

    var add = function (a) {
        return x + a;
    }

    return{
        publicTest: function (b) {
            return add(b);
        }
    }


})();

var UIController = (function () {

})();

var controller = (function (budgetCtrl, UICtrl) {
    var z =budgetCtrl.publicTest(5);
    return{
        anotherPublic: function () {
            console.log(z);
        }
    }
})(budgetController, UIController);*/

//  BUDGET CONTROLLER
var budgetController = (function () {

    var Expence = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expence.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expence.prototype.getPercentages = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                //if array is empty
                ID = 0;
            }
            //Create new item based on inc or 'exp' type
            if (type === 'exp') {
                newItem = new Expence(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //Return new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            //id = 3
            //data.allItems[type][id]
            //[1 2 4 6 8]
            //index=3
            //нужно создать массив с ID для выяснения индекса в массве который нужно удалить
            ids = data.allItems[type].map(function (current) {
                return current.id;
            }); //map() отличается от forEach() тем что возращает другой новый массив

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1); //удаление из массива по индексу
            }

        },

        calculateBadget: function () {

            //calculate total income and expencses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            /*
            a=20
            b=10
            c=40
            income = 100
            a = 20/100=20%
            b=10/100=10%
            c=40/100=40%
            */

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentages();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };


})();


//UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;
        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands

        2310.4567 -> +2,310.46
        2000 -> 2,000.00
        */

        num = Math.abs(num); //возвращает абсолютное значение числа(модуль числа)
        num = num.toFixed(2); //метод чила показівает указанное число десятичніх знаков возращает String

        numSplit = num.split('.'); //метод возращает массив с разделеных чисел

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);  //метод позволяет взять часть текста(стринга) substr(позиция, кол-во символов)
            // input 23510 --> output 23,510
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //преобразование в число вместе с десятичными
            }
        },
        //Public method to add to HTML document
        addListItem: function (obj, type) {
            var html, newHtml, element;
            //Create HTML String with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer; //записываем переменную данные из базы путей куда втавлять данные будем
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer; //записываем переменную данные из базы путей куда втавлять данные будем
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //создает не массив а list!

            //Есть маленький трюк для пергонки list в array  с помощью метода slice()
            // fields.slice() - не сработает на list так это не array(функция берет массив и возращяет массив), поэтому
            fieldsArr = Array.prototype.slice.call(fields);  //мы используем call метод на методе call note: метод call() позволяет использовать метод из другого объекта

            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });

            fieldsArr[0].focus(); //метод который переносит фокус на указанный элемент (в нащем случае inputDescription)

        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentagesLabel); //и снова получаем nodelist

            //todo до конца не понял
            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';// do somth
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, year, month, months;
            now = new Date(); //если ничего не ввести в конструктор то он вернет сегодняшний день

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function () {
            var fields;

            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMStrings: function () {
            return DOMstrings;
        }
    };

})();


//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListernes = function () {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', controllAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                controllAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBadget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercenteges = function () {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        //3.  Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var controllAddItem = function () {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();
        //проверка на заполненость форм
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) { // Читаем: инпут не пустой и не нечисло(то есть число)

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercenteges();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        //console.log(event.target); //свойство события: в консоль выведется элемент на который кликнуто
        //console.log(event.target.parentNode.parentNode.parentNode); //parentNode  - свойство подымается к родителю
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //теперь у родителя выберем свойство id
        if (itemID) {
            // inc-1
            splitID = itemID.split('-'); //split метод который вохращает массив из поделеных элементов в нашем случае вернет ['inc', '1']
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercenteges();
        }
    };

    return {
        init: function () {
            console.log('Start');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListernes();
        }
    };


})(budgetController, UIController);

controller.init();