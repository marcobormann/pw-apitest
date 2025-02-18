import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach( async({page}) => {

  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    }) 
  })

  await page.goto('http://conduit.bondaracademy.com/')

})

test('load page', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "Marco's title"
    responseBody.articles[0].description = "Marco also modified the description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
    console.log(responseBody)
  })

  await page.getByText('Global Feed').click()

  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toHaveText("Marco's title")
  await expect(page.locator('app-article-list p').first()).toHaveText("Marco also modified the description")
});

test('delete article debug', async({page, request}) => {
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
  console.log(accessToken)
  
  try {
    const response = await fetch("https://conduit-api.bondaracademy.com/api/articles", {
      method: "POST",
      headers: {
        Authorization: `Token ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        article: {
          title: "Test article",
          description: "Test description",
          body: "Test text",
          tagList: []
        }
      })
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Fetch error:", response.status, errorData);
    } else {
      console.log("Fetch success:", await response.json());
    }
  } catch (error) {
    console.error("Fetch request failed:", error);
  }
})

test('delete article', async({page, request}) => {
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
  
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    data: {
      article: {title: "Test article", description: "Test description", body: "Test text", tagList: []}
    },
    headers: {
      Authorization: `Token ${accessToken}`
    }
  })
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.locator('app-article-list h1').first().click()
  await page.getByRole('button', {name: 'Delete Article'}).first().click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).not.toHaveText("Test article")
})


test('create and delete article via api', async({page, request}) => {
  
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    data: {
      article: {title: "Test article to delete", description: "Test description to delete", body: "Test text to delete", tagList: []}
    },
  })
  expect(articleResponse.status()).toEqual(201)

  const articleResponseBody = await articleResponse.json() 
  const slug = articleResponseBody.article.slug

  const deleteResponse = await request.delete('https://conduit-api.bondaracademy.com/api/articles/' + slug, {
  })
  console.log(deleteResponse)
  expect(deleteResponse.status()).toEqual(204)

})

test('create article via ui and delete via api', async({page, request}) => {
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name: 'Article Title'}).fill('Creation via UI test')
  await page.getByRole('textbox', {name: 'What\'s this article about?'}).fill('Test description')
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('Test text')
  await page.getByRole('button', {name: 'Publish Article'}).click()
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json() 
  const slugId = articleResponseBody.article.slug

  await expect(page.locator('app-article-page h1')).toHaveText("Creation via UI test")
  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).toHaveText("Creation via UI test")

  const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`)
  console.log(deleteResponse)
  expect(deleteResponse.status()).toEqual(204)
})


