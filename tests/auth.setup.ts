import { test as setup } from '@playwright/test';
import user from '../.auth/user.json';
import fs from 'fs'

const authFile = '.auth/user.json'

setup('authentication', async({request}) => {
    // await page.goto('http://conduit.bondaracademy.com/')
    // await page.getByText('Sign in').click()
    // await page.getByPlaceholder("Email").clear()
    // await page.getByPlaceholder("Email").fill("marco@bormann.com")
    // await page.getByPlaceholder("Password").clear()
    // await page.getByPlaceholder("Password").fill("test1234")
    // await page.getByRole('button', {name: 'Sign in'}).click()
    // await page.waitForResponse('*/**/api/tags')

    // await page.context().storageState({path: authFile})
    
    const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user": {
            "email": "marco@bormann.com",
            "password": "test1234"
          }
        }
      })
      const responseBody = await response.json()
      const accessToken = responseBody.user.token
      user.origins[0].localStorage[0].value = accessToken
      fs.writeFileSync(authFile, JSON.stringify(user))

      process.env['ACCESS_TOKEN'] = accessToken
      console.log('Access Token created.')
})