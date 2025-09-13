import {Link, Outlet, useNavigate, useParams} from 'react-router-dom';

import Header from '../Header.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {deleteEvent, fetchEvent, queryClient} from "../../Utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
    const params = useParams();
    const navigate = useNavigate();
    const {data, isPending, isError, error} =
        useQuery({
            queryKey: ['event-details', {id: params.id}],
            queryFn: ({signal}) => fetchEvent({signal, id: params.id}),
        });

// Delete, Edit
  const {mutate}  = useMutation({
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
    return (
        <>
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
                                <button onClick={handleDelete}>Delete</button>
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
