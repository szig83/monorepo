import { FC } from 'react'

interface Props {
	text: string
	className?: string
	lineColor?: string
}

const DividerWithText: FC<Props> = ({ text, className = '', lineColor = 'border-gray-300' }) => {
	return (
		<div className={`flex items-center ${className}`}>
			<hr className={`flex-grow border-t-1 ${lineColor}`} />
			<span className="mx-4 text-sm font-medium text-gray-500">{text}</span>
			<hr className={`flex-grow border-t-1 ${lineColor}`} />
		</div>
	)
}

export default DividerWithText
