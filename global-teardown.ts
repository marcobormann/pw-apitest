import { expect, request } from "@playwright/test"

async function globalTeardown(){
    console.log('Starting teardown')
    const context = await request.newContext()
    const deleteResponse = await context.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`, {
        headers: {
            Authorization: `Token ${process.env.ACCESS_TOKEN}`
        }
    })
    expect(deleteResponse.status()).toEqual(204)
}

export default globalTeardown;