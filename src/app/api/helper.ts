// A function to fetch data from the backend
export async function fetchData(): Promise<any> {
    try {
        const response = await fetch('https://your-backend-url.com/api/data');
        if (!response.ok) {
            throw new Error(`获取后端数据失败: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;  // Re-throw the error to be handled by the calling code
    }
}

// A function to post data to the backend
export async function postData(data: any): Promise<any> {
    try {
        const response = await fetch('https://your-backend-url.com/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Failed to post data: ${response.statusText}`);
        }
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error(error);
        throw error;  // Re-throw the error to be handled by the calling code
    }
}