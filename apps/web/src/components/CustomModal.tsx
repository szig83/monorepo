'use client';

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useRouter } from 'next/navigation';

export default function CustomModal({
	modalTitle,
	modalFooter,
	children,
}: {
	modalTitle?: string;
	modalFooter?: React.ReactNode;
	children: React.ReactNode;
}) {
	const router = useRouter();
	return (
		<Modal defaultOpen={true} radius="sm" onClose={() => router.back()}>
			<ModalContent className="bg-gray-100">
				{() => (
					<>
						{modalTitle && (
							<ModalHeader className="flex flex-col gap-1 bg-white">{modalTitle}</ModalHeader>
						)}
						<ModalBody className="rounded-sm bg-white">{children}</ModalBody>
						{modalFooter && <ModalFooter className="justify-center">{modalFooter}</ModalFooter>}
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
