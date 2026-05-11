export const getCsrfToken = () => {
  return document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content')
}