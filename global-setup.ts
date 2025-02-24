import { expect, request } from "@playwright/test"
import user from '../pw-apitest-app/.auth/user.json';
import fs from 'fs'

async function globalSetup() {
    console.log('Starting setup')
    const context = await request.newContext()
    const authFile = '.auth/user.json'

    const authResponse = await context.post('https://conduit-api.bondaracademy.com/api/users/login', {
        
        
        data: {
            "user": {
                "email": "marco@bormann.com",
                "password": "test1234"
                }
            }
        })
        const responseBody = await authResponse.json()
        const accessToken = responseBody.user.token
        user.origins[0].localStorage[0].value = accessToken
        fs.writeFileSync(authFile, JSON.stringify(user))
        process.env['ACCESS_TOKEN'] = accessToken
        console.log('Access Token created.')

        const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles', {
            data: {
              article: {title: "Likes counter test article global", description: "Test description", body: "Test text", tagList: []}
            },
            headers: {
                Authorization: `Token ${process.env.ACCESS_TOKEN}`
            }
        })
        expect(articleResponse.status()).toEqual(201)
        const response = await articleResponse.json()
        const slugId = response.article.slug
        process.env['SLUGID'] = slugId
        console.log(`Article created. slugId:${process.env.SLUGID}`)
}

export default globalSetup;