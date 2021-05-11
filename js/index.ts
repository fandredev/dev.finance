/* Interfaces & Types Start */
interface ModalProps {
  open: () => void
  close: () => void
}
interface TransactionsProps {
  all: any
  add: (transaction) => void
  remove: (index: number) => void
  incomes: () => number
  expenses: () => number
  total: () => number
}
interface TransactionsData {
  description: string
  amount: number
  date: string
}
interface TransactionsDataAmountString {
  description: string
  amount: string
  date: string
}
interface DomProps {
  innerHTMLTransaction: (transactions: TransactionsData, index: string) => string
  addTransactions: (transactions: TransactionsData, index: string) => void,
  transactionsContainer: HTMLElement,
  updateBalance: () => void,
  clearTransactions: () => void
}
interface InputElements {
  description: HTMLInputElement
  amount: HTMLInputElement
  date: HTMLInputElement
}
interface FormProps extends Readonly<InputElements> {
  getValues: () => TransactionsDataAmountString
  validateFields: () => void
  submit: (event: Event) => void // SubmitEvent
  clearFields: () => void,
  formatValues: () => void
}
type IncomeOrExpense = 'income' | 'expense'
interface UtilsProps {
  formatCurrency: (value: number | string) => string
  formatAmount: (value: string | number) => any
  formatDate: (value: string) => string
}
interface StorageProps {
  get:() => void
  set:(transaction: TransactionsData) => void
}

/* Interfaces & Types End */

const Modal: ModalProps = {
  open(): void {
    document.querySelector('.modal-overlay').classList.add('active')
  },
  close(): void {
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}
const Storages: StorageProps = {
  get(){
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },
  set(transactions: TransactionsData){
    localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
  }
}
const transaction: TransactionsProps = {
  all: Storages.get(),
  add(t: TransactionsData) {
    transaction.all.push(t)
    App.reload()
  },
  remove(index) {
    transaction.all.splice(index, 1)
    App.reload()
  },
  incomes() {
    let income = 0
    transaction.all.forEach(transaction => {
      if (transaction.amount > 0) income += transaction.amount
    })
    return income
  },
  expenses() {
    let expense = 0
    transaction.all.forEach(transaction => {
      if (transaction.amount < 0) expense += transaction.amount
    })
    return expense

  },
  total() {
    return transaction.incomes() + transaction.expenses()
  }
}

const DOM: DomProps = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  innerHTMLTransaction(transaction: TransactionsData, index: string) {
    const CSSClass: IncomeOrExpense = transaction.amount > 0 ? 'income' : 'expense'
    const amount: string | number = Utils.formatCurrency(transaction.amount)

    const html = `
      <tr>
        <td class="description">${transaction.description}</td>
        <td class="${CSSClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <img onclick="transaction.remove(${index})" src="assets/minus.svg" alt="Remover transação" />
        </td>
    </tr>
    `
    return html
  },
  addTransactions(transaction: TransactionsData, index: string) {
    const tr: HTMLTableRowElement = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(transaction.incomes())
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(transaction.expenses())
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(transaction.total())
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}
const Utils: UtilsProps = {
  formatCurrency(value) {
    const signal = value < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')
    value = +value / 100
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return `${signal}${value}`
  },
  formatAmount(value) {
    value = Number(value) * 100

    return Math.round(value)
  },
  formatDate(date) {
    const splittedDate = date.split('-')

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  }
}
const Form: FormProps = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields() {
    const { description, date, amount } = Form.getValues()
    console.log(description, date, amount)
    if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
      throw new Error('Por favor, preencha todos os campos.')
    }
  },
  formatValues() {
    let { description, date, amount } = Form.getValues()
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return { description, date, amount }
  },

  clearFields() {
    Form.description.value = '',
      Form.amount.value = '',
      Form.date.value = ''
  },
  submit(event: Event) {
    event.preventDefault()
    try {
      Form.validateFields()
      const formatValuesTransaction = Form.formatValues()
      transaction.add(formatValuesTransaction)
      Form.clearFields()
      Modal.close()
    }
    catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    transaction.all.forEach((transaction: TransactionsData, i) => DOM.addTransactions(transaction, String(i)))
    DOM.updateBalance()
    Storages.set(transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()
