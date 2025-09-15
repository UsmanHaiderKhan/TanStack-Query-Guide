import {Link, Outlet, useNavigate, useParams} from 'react-router-dom';

import Header from '../Header.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {deleteEvent, fetchEvent, queryClient} from "../../Utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import {useState} from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
    const [isDeleting, setIsDeleting] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    const {data, isPending, isError, error} =
        useQuery({
            queryKey: ['event-details', {id: params.id}],
            queryFn: ({signal}) => fetchEvent({signal, id: params.id}),
        });

// Delete, Edit
    const {mutate, isPending: isDeletionPending, isError: isDeletionError, error: deletionError} = useMutation({
        mutationKey: ['delete-event'],
        mutationFn: deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events'], refetchType: 'none'});
            navigate('/events');
        }
    })

    function handleDelete() {
        mutate({id: params.id});
    }

    function handleStartDelete() {
        setIsDeleting(true);
    }

    function handleCancelDelete() {
        setIsDeleting(false);
    }

    return (
        <>
            {isDeleting && (
                <Modal onClose={handleCancelDelete}>
                    <h2>Are you sure?</h2>
                    <p>Do you really want to delete this event?</p>
                    <div className="form-actions">
                        {isDeletionPending && <p>Deleting event, Please Wait...</p>}
                        {!isDeletionPending && (
                            <>
                                <button onClick={handleCancelDelete} className="button-text">Cancel</button>
                                <button onClick={handleDelete} className="button">Delete</button>
                            </>
                        )}
                    </div>
                    {isDeletionError && <ErrorBlock title="Failed to delete Event."
                                                  message={deletionError.info?.message ||
                                                      'Failed to delete event. please try again later...!'}/>}
                </Modal>
            )}
            <Outlet/>
            <Header>
                <Link to="/events" className="nav-item">
                    View all Events
                </Link>
            </Header>
            <article id="event-details">
                {isPending && <p>Loading event details...</p>}
                {data && (
                    <>
                        <header>
                            <h1>{data.title}</h1>
                            <nav>
                                <button onClick={handleStartDelete}>Delete</button>
                                <Link to="edit">Edit</Link>
                            </nav>
                        </header>
                        <div id="event-details-content">
                            <img src={`http://localhost:3000/${data.image}`} alt={data.title}/>
                            <div id="event-details-info">
                                <div>
                                    <p id="event-details-location">{data.location}</p>
                                    <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} - {data.time}</time>
                                </div>
                                <p id="event-details-description">{data.description}</p>
                            </div>
                        </div>
                    </>
                )}

                {isError && <ErrorBlock title="Failed to load event details."
                                        message={error.info?.message || 'Failed to load event details. please try again later...!'}/>}
            </article>
        </>
    );
}
