'use client'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import LogoutButton from '@/components/auth/LogoutButton'
import { FaAngleDown } from 'react-icons/fa6'
import Image from 'next/image'
import Link from 'next/link'

export default function UserDropdown({
	userFullName = '',
	userImage = '',
}: Readonly<{ userFullName?: string; userImage?: string }>) {
	return (
		<Dropdown showArrow={true}>
			<DropdownTrigger>
				<div className="flex cursor-pointer items-center gap-2">
					{userImage !== '' && (
						<Image
							src={userImage}
							alt={userFullName}
							width={32}
							height={32}
							className="rounded-full"
						/>
					)}
					{userFullName}
					<FaAngleDown />
				</div>
			</DropdownTrigger>
			<DropdownMenu aria-label="Static Actions">
				<DropdownItem key="profil" textValue="Logout">
					<Link href="/user-profile">Profil</Link>
				</DropdownItem>
				<DropdownItem key="logout" textValue="Logout">
					<LogoutButton />
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	)
}
