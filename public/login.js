document.getElementById('loginForm').onsubmit = async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => { data[key] = value });

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.redirected) {
            // Redirect to the home page if login is successful
            window.location.href = response.url;
        } else {
            // Handle error responses
            const errorMessage = await response.text();
            alert(errorMessage); // Alert the user about the error
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.'); // General error alert
    }
};
