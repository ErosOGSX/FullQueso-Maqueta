import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
//eslint-disable-next-line no-unused-vars
const InputField = ({ id, label, register, required, error, type = 'text', ...props }) => (
    <div className='w-full'>
        <label htmlFor={id} className='block font-body font-bold text-brand-dark mb-2'> {label} </label>
        <input
          id={id}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(id, { required: required && 'Este campo es obligatorio' })}
          {...props}
          className={`w-full p-3 font-body bg-neutral-surface border-2 rounded-lg transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-neutral-border focus:border-brand-primary'} focus:outline-none`}
        />
        {error && <p id={`${id}-error`} role='alert' className='text-red-500 text-sm mt-1'> {error.message} </p>}
    </div>
);
const EventoPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: {errors}, reset } = useForm()

    const onSubmit = (data) => {
        // TODO: Enviar datos a la API/back-end
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Datos del Evento (solo dev):', data);
        }
        // TODO: Reemplazar alert por un toast/UI no bloqueante
        alert('¡Gracias por enviar los detalles de tu evento! Nos pondremos en contacto contigo pronto.');
        reset();
    };

    const handleClearForm = () => {
        reset();
    }

    return (
        <div className='min-h-screen bg-neutral-background flex flex-col items-center p-4 sm:p-8'>
            <h1 className='text-3xl font-display-alt text-brand-dark mb-2'>Full<span className='text-brand-yellow'>Queso</span>Eventos</h1>
            
            <p className='font-body text-neutral-text-muted text-center mb-8 max-w-lg'>¿Planeando una fiesta, reunión o evento corporativo? ¡Nosotros nos encargamos de la comida! Rellena el formulario y contactaremos.</p>

                <InputField id='fullName' label='Nombre Completo' register={register} required error={errors.fullName} />
                <InputField id='email' label='Correo Electrónico' type='email' register={register} required error={errors.email} />
                <InputField id='phone' label='Teléfono' type='tel' register={register} required error={errors.phone} />
                <InputField id='city' label='Ciudad del Evento' register={register} required error={errors.city} />
                <InputField id='eventDate' label='Fecha (Opcional)' type='date' register={register} error={errors.eventDate} />
                <div>
                    <label htmlFor="details" className='block font-body font-bold text-brand-dark mb-2'>Detalles del Evento</label>

                    <textarea
                      id="details"
                      {...register('details', {
                        required: 'Cuéntanos un poco sobre tu evento'
                      })}
                      rows="4"
                      className={`w-full p-3 font-body bg-neutral-surface border-2 rounded-lg transition-colors ${
                        errors.details
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-neutral-border focus:border-brand-primary'
                      } focus:outline-none`}
                    ></textarea>
                    {errors.details && <p className='text-red-500 text-sm mt-1'> {errors.details.message} </p>}
                </div>

                                {/* BOTÓN DE ENVÍO MAIN */}

                <button type='submit' className='w-full bg-brand-primary text-white font-bold font-body py-3 rounded-lg hover:bg-brand-primary-light transition-colors text-lg'>Enviar Solicitud</button>
                                
                                {/* BOTONES DE ACCIÓN SECUNDARIOS */}

                <div className='flex justify-between items-center mt-4'>

                    <button type='button' onClick={() => navigate(-1)} className='font-body font-bold text-neutral-text-muted hover:text-brand-dark transition-colors'> Volver </button>

                    <button type='button' onClick={handleClearForm} className='font-body font-bold text-brand-primary hover:underline transition-colors'>Limpiar Formulario</button>

                </div>


            </form>

        </div>
    )
}

export default EventoPage