var modal = {
    open: function () {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close: function () {
        document.querySelector('.modal-overlay').classList.remove('active');
    }
};
