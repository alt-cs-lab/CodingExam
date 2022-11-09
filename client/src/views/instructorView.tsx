// Copyright 2022 under MIT License
import { Button, Intent } from "@blueprintjs/core"
import * as React from "react"
import styled from "styled-components"
import { User } from "../App"
import { useAppSelector } from "../app/hooks"
import { selectFeedbackMap } from "../slices/examSlice"
import { CreateExamView } from "./createExamView"
import { ExamView } from "./examView"

/**
 * Props for InstructorView
 */
interface InstructorViewProps {
	token: string
}

/**
 * Style for InstructorView
 */
const StyledInstructorView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

/**
 * Style for the header elements
 */
const StyledHeaderContainer = styled.div`
	padding: 10px;
`

/**
 * Style for the list of students
 */
const StyledStudentListContainer = styled.div`
	display: flex;
	flex-direction: column;
`

/**
 * InstructorView Component
 * 
 * This component renders when the Instructor is viewing the application.
 * They are presented with a list of their students that have taken the exam.
 * They can click on a student and view their responses, as well as leave
 * feedback.
 */
export const InstructorView = React.memo( ( props: InstructorViewProps ) => {

	// State that holds the array of Users
	const [ users, setUsers ] = React.useState( [] as User[] )
	// State that determines which view should be shown to the user
	const [ view, setView ] = React.useState( "createExamView" as View )
	// State that holds the selected student's canvasUserId
	const [ canvasUserId, setCanvasUserId ] = React.useState( "" )

	// feedbackMap from the store
	const feedbackMap = useAppSelector( selectFeedbackMap )

	/**
	 * Called when a student is clicked - tells the InstructorView
	 * to render that student's responses
	 */
	const handleStudentClick = React.useCallback( ( id: string ) => {
		setView( "examView" )
		setCanvasUserId( id )
	}, [] )

	/**
	 * Called when the Instructor clicks the "Submit Feedback" button -
	 * updates feedback in the store
	 */
	const handleFeedbackClick = React.useCallback( async () => {
		const data = await fetch( "http://localhost:9000/api/instructorfeedback", {
			method: "POST",
			body: JSON.stringify(
				Array.from( feedbackMap.values() )
			),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"token": props.token,
				"userid": canvasUserId
			}
		} )

		const json = await data.json()
		console.log( json )

		setView( "studentListView" )
	}, [ feedbackMap, canvasUserId ] )

	/**
	 * Called on render - pulls in the list of students that have taken
	 * the exam
	 */
	React.useEffect( () => {
		const initUsers = async () => {
			const data = await fetch( "http://localhost:9000/api/examtakers", {
				headers: {
					"token": props.token
				}
			} )

			const json = await data.json()
			const users: User[] = json.users

			setUsers( users )
		}

		initUsers()
	}, [] )

	// Render the component
	return (
		<StyledInstructorView>
			<StyledHeaderContainer>
				<Button 
					disabled={view !== "examView"}
					text="Back"
					minimal
					intent={Intent.PRIMARY}
					onClick={() => setView( "studentListView" )}
				/>
				{view === "studentListView" && (
					<h3>Student List</h3>
				)}
			</StyledHeaderContainer>
			{view === "createExamView" && (
				<CreateExamView 
					token={props.token}
				/>
			)}
			{view === "studentListView" && (
				<StyledStudentListContainer>
					{users.map( user => (
						<Button 
							key={user.canvasUserId}
							text={user.fullName}
							minimal
							intent={Intent.NONE}
							onClick={() => handleStudentClick( user.canvasUserId )}
							alignText="left"
						/>
					) )}
				</StyledStudentListContainer>
			)}
			{view === "examView" && (
				<>
					<ExamView 
						disabled
						feedback={true}
						canvasUserId={canvasUserId}
						token={props.token}
					/>
					<Button 
						text={"Submit Feedback"}
						onClick={() => handleFeedbackClick()}
					/>
				</>
			)}
		</StyledInstructorView>
	)
} )
InstructorView.displayName = "InstructorView"

type View = 
	"studentListView" 
  | "examView"
  | "createExamView"