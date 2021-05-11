/* Interfaces & Types End */
var Modal = {
    open: function () {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close: function () {
        document.querySelector('.modal-overlay').classList.remove('active');
    }
};
var Storages = {
    get: function () {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
    },
    set: function (transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
    }
};
var transaction = {
    all: Storages.get(),
    add: function (t) {
        transaction.all.push(t);
        App.reload();
    },
    remove: function (index) {
        transaction.all.splice(index, 1);
        App.reload();
    },
    incomes: function () {
        var income = 0;
        transaction.all.forEach(function (transaction) {
            if (transaction.amount > 0)
                income += transaction.amount;
        });
        return income;
    },
    expenses: function () {
        var expense = 0;
        transaction.all.forEach(function (transaction) {
            if (transaction.amount < 0)
                expense += transaction.amount;
        });
        return expense;
    },
    total: function () {
        return transaction.incomes() + transaction.expenses();
    }
};
var DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    innerHTMLTransaction: function (transaction, index) {
        var CSSClass = transaction.amount > 0 ? 'income' : 'expense';
        var amount = Utils.formatCurrency(transaction.amount);
        var html = "\n      <tr>\n        <td class=\"description\">" + transaction.description + "</td>\n        <td class=\"" + CSSClass + "\">" + amount + "</td>\n        <td class=\"date\">" + transaction.date + "</td>\n        <td>\n          <img onclick=\"transaction.remove(" + index + ")\" src=\"assets/minus.svg\" alt=\"Remover transa\u00E7\u00E3o\" />\n        </td>\n    </tr>\n    ";
        return html;
    },
    addTransactions: function (transaction, index) {
        var tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },
    updateBalance: function () {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(transaction.total());
    },
    clearTransactions: function () {
        DOM.transactionsContainer.innerHTML = '';
    }
};
var Utils = {
    formatCurrency: function (value) {
        var signal = value < 0 ? '-' : '';
        value = String(value).replace(/\D/g, '');
        value = +value / 100;
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        return "" + signal + value;
    },
    formatAmount: function (value) {
        value = Number(value) * 100;
        return Math.round(value);
    },
    formatDate: function (date) {
        var splittedDate = date.split('-');
        return splittedDate[2] + "/" + splittedDate[1] + "/" + splittedDate[0];
    }
};
var Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues: function () {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        };
    },
    validateFields: function () {
        var _a = Form.getValues(), description = _a.description, date = _a.date, amount = _a.amount;
        console.log(description, date, amount);
        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor, preencha todos os campos.');
        }
    },
    formatValues: function () {
        var _a = Form.getValues(), description = _a.description, date = _a.date, amount = _a.amount;
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return { description: description, date: date, amount: amount };
    },
    clearFields: function () {
        Form.description.value = '',
            Form.amount.value = '',
            Form.date.value = '';
    },
    submit: function (event) {
        event.preventDefault();
        try {
            Form.validateFields();
            var formatValuesTransaction = Form.formatValues();
            transaction.add(formatValuesTransaction);
            Form.clearFields();
            Modal.close();
        }
        catch (error) {
            alert(error.message);
        }
    }
};
var App = {
    init: function () {
        transaction.all.forEach(function (transaction, i) { return DOM.addTransactions(transaction, String(i)); });
        DOM.updateBalance();
        Storages.set(transaction.all);
    },
    reload: function () {
        DOM.clearTransactions();
        App.init();
    }
};
App.init();
