interface ModalProps {
  open: () => void
  close: () => void
}

const modal: Readonly<ModalProps> = {
  open(): void {
    document.querySelector('.modal-overlay').classList.add('active')
  },
  close(): void {
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}