new Vue({
    el: '#app',
    data: {
        lessons: [], // Will be populated from API
        cart: [],
        showCart: false,
        sortBy: 'subject',
        sortOrder: 'asc',
        searchQuery: '',
        checkoutForm: {
            name: '',
            phone: ''
        }
    },
    computed: {
        sortedLessons() {
            return [...this.lessons].sort((a, b) => {
                let modifier = this.sortOrder === 'asc' ? 1 : -1;
                if (this.sortBy === 'price' || this.sortBy === 'spaces') {
                    return (a[this.sortBy] - b[this.sortBy]) * modifier;
                }
                return a[this.sortBy].localeCompare(b[this.sortBy]) * modifier;
            });
        },
        isCheckoutValid() {
            const nameRegex = /^[A-Za-z\s]+$/;
            const phoneRegex = /^[0-9]+$/;
            return this.cart.length > 0 &&
                nameRegex.test(this.checkoutForm.name) &&
                phoneRegex.test(this.checkoutForm.phone);
        }
    },
    methods: {
        fetchLessons() {
            fetch('http://localhost:3000/api/lessons')
                .then(response => response.json())
                .then(data => {
                    this.lessons = data;
                })
                .catch(error => console.error('Error:', error));
        },
        searchLessons() {
            if (this.searchQuery.trim() === '') {
                this.fetchLessons();
                return;
            }
            fetch(`http://localhost:3000/api/search?q=${this.searchQuery}`)
                .then(response => response.json())
                .then(data => {
                    this.lessons = data;
                })
                .catch(error => console.error('Error:', error));
        },
        submitOrder() {
            if (!this.isCheckoutValid) return;

            const order = {
                name: this.checkoutForm.name,
                phone: this.checkoutForm.phone,
                lessons: this.cart.map(item => item._id)
            };

            fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order)
            })
                .then(response => response.json())
                .then(data => {
                    alert('Order submitted successfully!');
                    this.cart = [];
                    this.showCart = false;
                    this.checkoutForm.name = '';
                    this.checkoutForm.phone = '';
                    this.fetchLessons(); // Refresh lessons to get updated spaces
                })
                .catch(error => console.error('Error:', error));
        }
    },
    mounted() {
        this.fetchLessons();
    }
});
