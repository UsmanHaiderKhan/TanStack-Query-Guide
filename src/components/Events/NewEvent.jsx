import { Link, useNavigate } from 'react-router-dom';
import {useMutation} from "@tanstack/react-query";

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {createNewEvent, queryClient} from "../../Utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function NewEvent() {
  const navigate = useNavigate();
  const {mutate, isPending, isError, error}=useMutation({
   // mutationKey: ['new-event'],
      mutationFn: createNewEvent,
      onSuccess: () =>{
          queryClient.invalidateQueries({queryKey: ['events']});
            navigate('/events');
      }
  })
  function handleSubmit(formData) {
      mutate({event: formData});
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
          {isPending && (<p>Sending data...</p>)}
          {!isPending && (
              <>
                  <Link to="../" className="button-text">
                      Cancel
                  </Link>
                  <button type="submit" className="button">
                      Create
                  </button>
              </>
          )}

      </EventForm>
        {isError && <ErrorBlock title="Failed to create new Event." message={error.info?.message ||
            'Failed to create event. please check your inputs and try again later...!'}/>}
    </Modal>
  );
}
