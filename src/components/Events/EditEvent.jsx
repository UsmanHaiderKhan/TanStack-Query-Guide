import {Link, redirect, useNavigate, useNavigation, useParams, useSubmit} from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {useQuery} from "@tanstack/react-query";
import {fetchEvent, queryClient, updateEvent} from "../../Utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
    const navigate = useNavigate();
    const {state} = useNavigation();
    const submit = useSubmit();
    const param = useParams();
    const {data, isPending, isError, error} = useQuery({
        queryKey: ['event-details', param.id],
        queryFn: ({signal}) => fetchEvent({signal, id: param.id}),
        staleTime: 10000,
    });
    // const {mutate} = useMutation({
    //     mutationFn: updateEvent,
    //     onMutate: async (data)=>{
    //         const newEvent = data.event;
    //        await queryClient.cancelQueries({queryKey: ['event-details', param.id]});
    //           const previousEvent = queryClient.getQueryData(['event-details', param.id]);
    //             queryClient.setQueryData(['event-details', param.id], newEvent);
    //             return {previousEvent};
    //     },
    //     onError: (error, variables, context) => {
    //         if (context?.previousEvent) {
    //             queryClient.setQueryData(['event-details', param.id], context.previousEvent);
    //         }
    //     },
    //     onSettled: () => {
    //         queryClient.invalidateQueries(['event-details', param.id]);
    //     }
    // });


    function handleSubmit(formData) {
        submit(formData, {method: 'PUT'});
        //mutate({id: param.id, event: formData});
        // navigate('../');
    }

    function handleClose() {
        navigate('../');
    }

    let content;
    if (isPending) {
        content = (
            <div className="center">
                <LoadingIndicator/>
            </div>
        )
    }
    if (isError) {
        content = (
            <>
                <ErrorBlock title="Failed to load event."
                            message={error.info?.message || "Failed to load the event. please check your inputs and try again later. "}/>
                <div className="form-actions">
                    <Link to="../" className="button"> Okay </Link>
                </div>
            </>
        )
    }
    if (data) {
        content = (
            <EventForm inputData={data} onSubmit={handleSubmit}>
                {state === 'submitting' ? (<p>Updating event...</p>) : (
                    <>
                        <Link to="../" className="button-text">
                            Cancel
                        </Link>
                        <button type="submit" className="button">
                            Update
                        </button>
                    </>

                )}

            </EventForm>
        )
    }

    return (
        <Modal onClose={handleClose}>
            {content}
        </Modal>
    );
}

export async function loader({params}) {
    return queryClient.fetchQuery({
        queryKey: ['event-details', params.id],
        queryFn: ({signal, queryKey}) => fetchEvent({signal, id: queryKey[1]}),

    });
}

export async function action({request, params}) {
    const formData = await request.formData();
    const updatedEventData = Object.fromEntries(formData);
    await updateEvent({id: params.id, event: updatedEventData});
    await queryClient.invalidateQueries(['event-details']);
    return redirect('../');
}
