// Copyright 2022 under MIT License
import { Button, Callout, Colors, Intent, Spinner } from "@blueprintjs/core"
import * as React from "react"
import { batch } from "react-redux"
import styled from "styled-components"
import { Feedback, Question, QuestionType, Response, Confidence } from "../App"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { CodingAnswer } from "../components/codingAnswer"
import { FeedbackBox } from "../components/feedbackBox"
import { MultipleChoice } from "../components/multipleChoice"
import { ParsonsProblem } from "../components/parsonsProblem"
import { ShortAnswer } from "../components/shortAnswer"
import { TrueFalse } from "../components/trueFalse"
import { examActions, selectQuestionById, selectQuestionIds, selectResponsesMap, selectToken, selectResponseState, selectConfidenceMap } from "../slices/examSlice"

// Props for the ExamView component
interface ExamViewProps {
	disabled?: boolean
	feedback?: boolean
	review?: boolean
	canvasUserId?: string
}

/**
 * Style for the ExamView
 */
const StyledExamView = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
`

/**
 * Style for the container that holds the questions
 */
export const StyledQuestionsContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`

/**
 * Style for a single question
 */
export const StyledQuestionContainer = styled.div`
	border: 1px solid ${Colors.BLACK};
	border-radius: 2px;
	margin-bottom: 25px;
`

/**
 * Style for a Question's header
 */
export const StyledQuestionHeader = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid ${Colors.BLACK};
	padding: 10px;
	background-color: ${Colors.LIGHT_GRAY4};
	font-weight: bold;
`

/**
 * ExamView Component
 * 
 * This component renders an exam and all of its questions for the user.
 * Depending on the type of user (Instructor or Learner), it will present a different
 * form the exam. The Instructor can only view student responses and leave feedback, and the
 * Learner can only take the exam and submit their responses.
 */
export const ExamView = ( props: ExamViewProps ) => {
	/**
	 * Selectors
	 */
	// Dispatch an event to the store
	const dispatch = useAppDispatch()
	// Exam response state
	const responseState = useAppSelector( selectResponseState )
	// Array of questionIds from the Redux store
	const questionIds = useAppSelector( selectQuestionIds )
	// Map of responses from the store
	const responsesMap = useAppSelector( selectResponsesMap )
	// Map of confidence ratings from the store
	const confidenceMap = useAppSelector( selectConfidenceMap )
	// token from the store
	const token = useAppSelector( selectToken )

	/**
	 * State
	 */
	// State that determines if the ExamView is in a loading state
	const [ loading, setLoading ] = React.useState( true )

	/**
	 * Callbacks
	 */
	/*
	Called on render - initializes the questions and responses
	in the store
	*/
	React.useEffect( () => {
		const initQuestions = async () => {
			// Fetch exam questions
			let data = await fetch( "/api/questions", {
				headers: {
					"token": token
				} 
			} )
			
			let json  = await data.json()
			const questions: Question[] = json.questions

			// Loop through questions and create ids and a map
			const newQuestionIds: number[] = []
			const newQuestionsMap = new Map<number, Question>()
			questions.forEach( question => {
				newQuestionIds.push( question.id )
				newQuestionsMap.set( question.id, question )
			} )

			// Fetch exam responses (if there are any)
			data = await fetch( "/api/responses", {
				headers: {
					"token": token,
					"userID": props.canvasUserId || ""
				}
			} )

			json = await data.json()
			const responses: Response[] = json.responses

			/*
			Loop through responses and create ids and a map 
			for responses and for confidence ratings
			*/
			const newResponseIds: number[] = []
			const newResponsesMap = new Map<number, Response>()
			responses.forEach( response => {
				newResponseIds.push( response.questionId )
				newResponsesMap.set( response.questionId, response )
			} )

			// Fetch exam confidence ratings 
			data = await fetch( "/api/confidence", {
				headers: {
					"token": token,
					"userID": props.canvasUserId || ""
				}
			} )

			json = await data.json()
			const confidence: Confidence[] = json.confidence

			// Loop through the confidence and create ids and a map
			const newConfidenceIds: number[] = []
			const newConfidenceMap = new Map<number, Confidence>()
			confidence.forEach( confidence => {
				newConfidenceIds.push( confidence.questionId )
				newConfidenceMap.set( confidence.questionId, confidence )
			} )

			// Fetch exam feedback
			data = await fetch( "/api/feedback", {
				headers: {
					"token": token,
					"userID": props.canvasUserId || ""
				}
			} )

			json = await data.json()
			const feedback: Feedback[] = json.feedback

			// Loop through the feedback and create ids and a map
			const newFeedbackIds: number[] = []
			const newFeedbackMap = new Map<number, Feedback>()
			feedback.forEach( feedback => {
				newFeedbackIds.push( feedback.questionId )
				newFeedbackMap.set( feedback.questionId, feedback )
			} )

			// Update the store
			batch( () => {
				dispatch( examActions.setFeedbackIds( newFeedbackIds ) )
				dispatch( examActions.setFeedbackMap( newFeedbackMap ) )
				dispatch( examActions.setQuestionIds( newQuestionIds ) )
				dispatch( examActions.setQuestionsMap( newQuestionsMap ) )
				dispatch( examActions.setResponseIds( newResponseIds ) )
				dispatch( examActions.setResponsesMap( newResponsesMap ) )
				dispatch( examActions.setConfidenceIds( newConfidenceIds ) )
				dispatch( examActions.setConfidenceMap( newConfidenceMap ) )
			} )

			setLoading( false )
		}

		// Call async function
		initQuestions()
	}, [] )

	/*
	Runs when the submit button is pressed - posts each
	response in the responsesMap to update the database
	*/
	const submit = React.useCallback( async () => {
		
		const data = questionIds.map( id => ( {
			questionId: id,
			value: responsesMap.get( id )?.value,
			confidence: confidenceMap.get( id )?.value
		} ) )

		try {
			const res = await fetch( "/api", {
				// Adding method type
				method: "POST",

				// Adding body or contents to send
				body: JSON.stringify( data ),
     
				// Adding headers to the request
				headers: {
					"Content-type": "application/json; charset=UTF-8",
					"token": token
				}
			} )
			const json = await res.json()
			dispatch( examActions.setResponseState( json.response ) )
		} 
		catch( e ) {
			console.error( e )
		}
	}, [ responsesMap ] )

	/**
	 * Render
	 */
	return (
		<StyledExamView>
			{loading && (
				<Spinner 
					size={50}
					style={{ padding: "50px" }}
				/>
			)}
			{!loading && (				
				<>
					<StyledQuestionsContainer>
						{questionIds.map( ( id, index ) => (
							<StyledQuestionContainer key={id}>
								<StyledQuestionHeader>
									Question {index + 1}
								</StyledQuestionHeader>
								<QuestionSwitch
									disabled={props.disabled}
									questionId={id}
								/>
								{props.feedback && (
									<FeedbackBox
										disabled={props.review}
										questionId={id}
									/>
								)}
							</StyledQuestionContainer>
						) )}
					</StyledQuestionsContainer>
					{!props.disabled && (
						<Button 
							text="Submit"
							onClick={submit}
							intent={Intent.PRIMARY}
							fill
						/>
					)}
					{responseState && responseState.includes( "Valid" ) && (
						<Callout intent="success">
							Success! Your exam was submitted.
						</Callout>
					)}
					{responseState && responseState.includes( "Invalid" ) && (
						<Callout intent="danger">
							Oh no! There was a problem saving your exam.  Contact your instructor for help.
						</Callout>
					)}
				</>
			)}
		</StyledExamView>
	)
} 
ExamView.displayName = "ExamView"

/**
 * Props for the QuestionSwitch Component
 */
interface QuestionSwitchProps {
	disabled?: boolean
	feedback?: boolean
	review?: boolean
	questionId: number
}

/**
 * QuestionSwitch Component
 * 
 * This component determines the type of a given question and 
 * returns a component of its corresponding type
 */
export const QuestionSwitch = React.memo( ( props: QuestionSwitchProps ) => {
	/**
	 * Selectors
	 */
	// Question from the store
	const question = useAppSelector( state => selectQuestionById( 
		state, 
		props.questionId 
	) )

	/**
	 * Render
	 */
	// Render the component based on the question's type
	switch ( question?.type ) {
	case QuestionType.MultipleChoice:
		return (
			<MultipleChoice
				disabled={props.disabled}
				questionId={question.id}
			/>
		)
	case QuestionType.TrueFalse:
		return (
			<TrueFalse
				disabled={props.disabled}
				questionId={question.id}
			/>
		)
	case QuestionType.ShortAnswer:
		return (
			<ShortAnswer
				disabled={props.disabled}
				questionId={question.id}
			/>
		)
	case QuestionType.CodingAnswer:
		return (
			<CodingAnswer
				disabled={props.disabled}
				questionId={question.id}
			/>
		)
	case QuestionType.ParsonsProblem:
		return (
			<ParsonsProblem
				disabled={props.disabled}
				questionId={question.id}
			/>
		)
	default:
		return null
	}
} )
QuestionSwitch.displayName = "QuestionSwitch"