// Register 

async function registerUser(userData) {
    const url = "https://localhost/user_management/create/";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData), // Convert the userData object to JSON
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to register user.");
        }

        const result = await response.json();
        return result; // Return the server's response
    } catch (error) {
        console.error("Error during registration:", error.message);
        throw error; // Re-throw the error for the caller to handle
    }
}

export { registerUser };
