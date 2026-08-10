export async function postRequest(
	url: string,
	payload: any
): Promise<any> {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	})

	if (!response.ok) {
		throw new Error(`POST request failed, response is ${JSON.stringify(response)}`)
	}

	const data = await response.json()
	return data
}

export async function putRequest(
	url: string,
	payload: any
): Promise<any> {
	const response = await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	})

	if (!response.ok) {
		throw new Error(`PUT request failed, response is ${JSON.stringify(response)}`)
	}

	const data = await response.json()
	return data
}

export async function getRequest(
	url: string
): Promise<any> {
	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`GET request failed, response is ${JSON.stringify(response)}`)
	}

	const data = await response.json()
	return data
}

export async function deleteRequest(
	url: string,
	payload: any
): Promise<any> {
	const response = await fetch(url, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	})

	if (!response.ok) {
		throw new Error(`DELETE request failed, response is ${JSON.stringify(response)}`)
	}

	const data = await response.json()
	return data
}
