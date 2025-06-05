export const convertDate = (myDate: string | undefined): string => {
  if (!myDate) return 'Unknown'
  const dateFormatter = new Intl.DateTimeFormat()
  const date = new Date(myDate)
  return dateFormatter.format(date)
}

export const isLate = (myDate: string | undefined): boolean => {
  if (!myDate) return false

  const [year, month, date] = splitDate(myDate)
  const dueDate = new Date(parseInt(year), parseInt(month), parseInt(date))
  return dueDate.getTime() < Date.now()
}

export const splitDate = (myDate: string): string[] => {
  return myDate.split('-')
}

export const today = new Date().toISOString().split('T')[0]
