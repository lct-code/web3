import {ReactNode} from 'react'

type Props = {
  title?:  string | ReactNode | undefined,
  message: string | ReactNode | undefined,
  type?:   'danger' | 'info'
}

export function Alert({title, message, type}: Props) {
  type = type ?? 'danger'
  const colorClasses = {
    info: {
      title: "bg-primary text-white",
      body:  "border-primary bg-primary-light dark:bg-primary-dark text-black dark:text-white"
    },
    danger: {
      title: "bg-danger text-white",
      body:  "border-danger bg-danger-lighter dark:bg-danger-darker text-black dark:text-white"
    },
  }
  return (
    <div role="alert" className="mb-32">
    {title && (
      <div className={`${colorClasses[type]?.title} font-bold rounded-t px-8 py-4`}>
        {title}
      </div>
    )}
      <div className={`${colorClasses[type]?.body} border border-t-0 rounded-b px-8 py-6`}>
        <p>{message}</p>
      </div>
    </div>
  )
}
