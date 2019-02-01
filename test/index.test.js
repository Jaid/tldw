import arrayToObjectKeys from "../dist"

it("should run with 1 argument", () => {
  const result = arrayToObjectKeys(["a", "b"])
  expect(result).toEqual({
    a: null,
    b: null,
  })
})

it("should run with an integer as second argument", () => {
  const result = arrayToObjectKeys(["a", "b"], 7)
  expect(result).toEqual({
    a: 7,
    b: 7,
  })
})

it("should run with a function as second argument", () => {
  const valueGenerator = (key, index) => `${index + 1}-${key}-x`
  const result = arrayToObjectKeys(["a", "b"], valueGenerator)
  expect(result).toEqual({
    a: "1-a-x",
    b: "2-b-x",
  })
})