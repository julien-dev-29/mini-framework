import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('loads the app with correct title', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText('todos')
})

test('adds a todo on Enter', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('Buy milk')
  await input.press('Enter')
  await expect(page.locator('.todo-list li')).toHaveCount(1)
  await expect(page.locator('.todo-list li label')).toHaveText('Buy milk')
})

test('adds multiple todos', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('First')
  await input.press('Enter')
  await input.fill('Second')
  await input.press('Enter')
  await input.fill('Third')
  await input.press('Enter')
  await expect(page.locator('.todo-list li')).toHaveCount(3)
})

test('renders correctly with exactly 2 todos', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('First')
  await input.press('Enter')
  await input.fill('Second')
  await input.press('Enter')
  await expect(page.locator('.todo-list li')).toHaveCount(2)
  await expect(page.locator('.todo-list li').nth(0)).toHaveText('First')
  await expect(page.locator('.todo-list li').nth(1)).toHaveText('Second')

  const labelHTML = await page.evaluate(() => {
    const label = document.querySelector('label[for="toggle-all"]')
    return label ? label.innerHTML : 'NO LABEL'
  })
  expect(labelHTML).toBe('')

  const mainChildren = await page.evaluate(() => {
    const main = document.querySelector('.main')
    return Array.from(main.children).map(c => c.tagName)
  })
  expect(mainChildren).toEqual(['INPUT', 'LABEL', 'UL'])
})

test('toggles a todo as completed', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('Task')
  await input.press('Enter')

  await page.locator('.toggle').click()
  await expect(page.locator('.todo-list li')).toHaveClass(/completed/)
})

test('deletes a todo', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('To delete')
  await input.press('Enter')
  await expect(page.locator('.todo-list li')).toHaveCount(1)

  await page.locator('.todo-list li').hover()
  await page.locator('.destroy').click()
  await expect(page.locator('.todo-list li')).toHaveCount(0)
})

test('shows correct item count', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('A')
  await input.press('Enter')
  await input.fill('B')
  await input.press('Enter')

  await expect(page.locator('.todo-count')).toContainText('2 items left')

  await page.locator('.toggle').first().click()
  await expect(page.locator('.todo-count')).toContainText('1 item left')
})

test('filters by Active', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('One')
  await input.press('Enter')
  await input.fill('Two')
  await input.press('Enter')

  await page.locator('.toggle').first().click()
  await page.locator('a[href="#/active"]').click()

  await expect(page.locator('.todo-list li')).toHaveCount(1)
  await expect(page.locator('.todo-list li label')).toHaveText('Two')
})

test('filters by Completed', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('One')
  await input.press('Enter')
  await input.fill('Two')
  await input.press('Enter')

  await page.locator('.toggle').first().click()
  await page.locator('a[href="#/completed"]').click()

  await expect(page.locator('.todo-list li')).toHaveCount(1)
  await expect(page.locator('.todo-list li label')).toHaveText('One')
})

test('shows all todos when All filter is selected', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('One')
  await input.press('Enter')
  await input.fill('Two')
  await input.press('Enter')

  await page.locator('.toggle').first().click()
  await page.locator('a[href="#/active"]').click()
  await page.locator('a[href="#/"]').click()

  await expect(page.locator('.todo-list li')).toHaveCount(2)
})

test('clears completed todos', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('One')
  await input.press('Enter')
  await input.fill('Two')
  await input.press('Enter')

  await page.locator('.toggle').first().click()
  await page.locator('.clear-completed').click()

  await expect(page.locator('.todo-list li')).toHaveCount(1)
  await expect(page.locator('.todo-list li label')).toHaveText('Two')
})

test('toggle all completes all todos', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('A')
  await input.press('Enter')
  await input.fill('B')
  await input.press('Enter')
  await input.fill('C')
  await input.press('Enter')

  await page.locator('#toggle-all').click()

  const items = page.locator('.todo-list li')
  await expect(items).toHaveCount(3)
  const counts = await items.evaluateAll(list =>
    list.filter(li => li.classList.contains('completed')).length
  )
  expect(counts).toBe(3)
})

test('persists todos after reload', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('Persistent task')
  await input.press('Enter')
  await expect(page.locator('.todo-list li')).toHaveCount(1)

  await page.reload()
  await expect(page.locator('.todo-list li')).toHaveCount(1)
  await expect(page.locator('.todo-list li label')).toHaveText('Persistent task')
})

test('hides footer when no todos', async ({ page }) => {
  await expect(page.locator('.footer')).not.toBeVisible()
})

test('shows clear completed button only when completed exist', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('Task')
  await input.press('Enter')

  await expect(page.locator('.clear-completed')).not.toBeVisible()

  await page.locator('.toggle').click()
  await expect(page.locator('.clear-completed')).toBeVisible()
})

test('route filter links have selected class', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('Test')
  await input.press('Enter')

  await expect(page.locator('a[href="#/"]')).toHaveClass(/selected/)
  await page.locator('a[href="#/active"]').click()
  await expect(page.locator('a[href="#/active"]')).toHaveClass(/selected/)
  await expect(page.locator('a[href="#/"]')).not.toHaveClass(/selected/)
})

test('double-click edits a todo', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('Edit me')
  await input.press('Enter')

  await page.locator('.todo-list li label').dblclick()
  const editInput = page.locator('.todo-list li .edit')
  await expect(editInput).toBeVisible()

  await editInput.fill('Edited!')
  await editInput.press('Enter')
  await expect(page.locator('.todo-list li label')).toHaveText('Edited!')
})

test('escape cancels editing', async ({ page }) => {
  const input = page.locator('.new-todo')
  await input.fill('Original')
  await input.press('Enter')

  await page.locator('.todo-list li label').dblclick()
  const editInput = page.locator('.todo-list li .edit')
  await editInput.fill('Changed')
  await editInput.press('Escape')

  await expect(page.locator('.todo-list li label')).toHaveText('Original')
})
