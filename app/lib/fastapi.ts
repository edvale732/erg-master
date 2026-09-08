export async function get_predictions() {
    const response = await fetch('http://localhost:8000/predictions');

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}