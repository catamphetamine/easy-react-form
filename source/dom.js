// export function submitChildForm(node)
// {
// 	while (node.firstChild)
// 	{
// 		node = node.firstChild
// 		if (node instanceof HTMLFormElement)
// 		{
// 			// Won't use `node.submit()` because it bypasses `onSubmit`.
// 			// Will click the submit button instead.
// 			const submit = node.querySelector('button[type=submit]')
// 			if (submit)
// 			{
// 				submit.click()
// 				return true
// 			}
// 		}
// 	}
// }
