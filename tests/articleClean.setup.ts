import { test as setup, expect } from '@playwright/test';

setup('delete article', async({request}) => {
    console.log('Article delete started.')
    const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`)
    expect(deleteResponse.status()).toEqual(204)
})