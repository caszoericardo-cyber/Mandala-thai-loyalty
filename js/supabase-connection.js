//import { createClient } from '@supabase/supabase-js';

// Reemplaza con los valores de tu panel de Supabase

// Local URL de Supabase
const SUPABASE_URL = 'http://127.0.0.1:54331';

// Remote URL de Supabase
//const SUPABASE_URL = 'https://suvqzrnayuynsdyatsdo.supabase.co';

// Local ANON KEY
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Remote ANON KEY
//const SUPABASE_ANON_KEY = 'sb_publishable_8PVJvBsIZ_GZZwFdoRkHRA_7pABUj6V';

let supabase = null;

// ============================================================
// CONFIGURACIÓN DE SUPABASE
// ============================================================

async function initSupabase() {

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        alert('⚠️ No hay información de Supabase. Por favor, configurar');
        return;
    }

    try {
        // Crear cliente de Supabase
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Mostrar éxito
        addNotification('✅ Conectado a Supabase exitosamente', 'success');

        clients = await getClients();
        staffList = await getStaffMembers();
        rewards = await getRewards();
        exps = await getExps();

    } catch (error) {
        //alert('❌ Error conectando a Supabase: ' + error.message);
        addNotification('❌ Error conectando a Supabase: ' + error.message, 'error');
    }
}

const addNotification = (message, type = 'success') => {
    const notificationSpace = document.getElementById('manual-notification');
    const result = document.createElement('div');
    result.innerHTML = `<div id="manual-notification" class="${type}">${message}</div>`;
    notificationSpace.appendChild(result);

    setTimeout(removeNotification, 1500);
}

const removeNotification = () => {
    const notificationSpace = document.getElementById('manual-notification');
    if (notificationSpace) {
        notificationSpace.innerHTML = '';
    }
}

async function getStaffMembers() {
    const { data, error } = await supabase
        .from('staff_members')
        .select(`
            id, 
            name,
            pin,
            role
            `
        );

    if (error) {
        console.error('Error:', error);
        alert('❌ Error obteniendo miembros del personal: ' + error.message);
        return [];
    }

    console.log("Miembros del personal obtenidos: ", data);

    return data;
}

async function getClients() {
    const { data, error } = await supabase
        .from('clients')
        .select(`
            id, 
            name, 
            email,
            phone, 
            points, 
            last_visit,
            redeem_request,
            notifications(
                id,
                msg,
                read
            ),
            history(
                id,
                date,
                type,
                delta
            )
            `
        );

    console.log("Clientes obtenidos: ", data);

    if (error) {
        console.error('Error:', error);
        alert('❌ Error obteniendo clientes: ' + error.message);
        return [];
    }

    return data;
}

async function getRewards() {
    const { data, error } = await supabase
        .from('rewards')
        .select(`
            id, 
            label,
            label_en,
            cost,
            icon
            `
        );

    if (error) {
        console.error('Error:', error);
        alert('❌ Error obteniendo recompensas: ' + error.message);
        return [];
    }

    console.log("Rewards obtenidas: ", data);
    return data;
}

async function getExps() {
    const { data, error } = await supabase
        .from('experiences')
        .select(`
            id, 
            label,
            label_en,
            pts,
            icon
            `
        );

    if (error) {
        console.error('Error:', error);
        alert('❌ Error obteniendo experiencias: ' + error.message);
        return [];
    }

    console.log("Experiencias obtenidas: ", data);
    return data;
}


window.onload = () => {
    // Inicializamos la conexión al cargar la ventana
    //supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    initSupabase();
    // Opcional: Ejecuta tus consultas aquí
    // fetchData();
};

async function agregarCliente(cliente, notifications = [], history = []) {
    console.log("cliente", cliente);

    const { data, error } = await supabase
        .from('clients')
        .insert([cliente])
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error agregando cliente: ' + error.message);
        return null;
    }
    
    const notification = await agregarNotificacion(cliente.id, notifications[0].msg);

    cliente.history = [];
    cliente.notifications = [notification]; // Agrega la notificación a las notificaciones del cliente

    return cliente; // Retorna el primer cliente agregado
}
window.agregarCliente = agregarCliente;

async function actualizarClientePts(cliente, pts) {

    const { data, error } = await supabase
        .from('clients')
        .update({
            points: pts
        })
        .eq('id', cliente.id)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error actualizando cliente: ' + error.message);
        return null;
    }

    console.log("cliente actualizado", data);

    return data[0]; // Retorna el cliente actualizado
}
window.actualizarClientePts = actualizarClientePts;

async function actualizarClienteRedeemRequest(cliente, requestId) {

    const { data, error } = await supabase
        .from('clients')
        .update({
            redeem_request: requestId
        })
        .eq('id', cliente.id)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error actualizando el request de redención del cliente: ' + error.message);
        return null;
    }

    console.log("cliente redeem actualizado", data);

    return data[0]; // Retorna el cliente actualizado
}
window.actualizarClienteRedeemRequest = actualizarClienteRedeemRequest;

async function actualizarClientePointsAndRedeemRequest(cliente, pts) {

    const { data, error } = await supabase
        .from('clients')
        .update({
            points: pts,
            redeem_request: null
        })
        .eq('id', cliente.id)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error actualizando el request actualizar el cliente: ' + error.message);
        return null;
    }

    console.log("cliente redeem pts actualizado", data);

    return data[0]; // Retorna el cliente actualizado
}
window.actualizarClientePointsAndRedeemRequest = actualizarClientePointsAndRedeemRequest;

async function agregarStaff(staff) {

    const { data, error } = await supabase
        .from('staff_members')
        .insert({
            name: staff.name,
            pin: staff.pin,
            role: staff.role
        })
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error agregando staff: ' + error.message);
        return null;
    }

    console.log("staff agregado", data);

    return data[0]; // Retorna el staff agregado
}
window.agregarStaff = agregarStaff;

async function eliminarStaff(staffId) {

    const { data, error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', staffId)

    if (error) {
        console.error('Error:', error);
        alert('❌ Error eliminando staff: ' + error.message);
        return null;
    }

    console.log("staff eliminado", staffId);

    return staffId; // Retorna el staff eliminado
}
window.eliminarStaff = eliminarStaff;

async function actualizarStaffPin(staff, newPin) {

    const { data, error } = await supabase
        .from('staff_members')
        .update({
            pin: newPin
        })
        .eq('id', staff.id)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error actualizando staff: ' + error.message);
        return null;
    }

    console.log("staff actualizado", data);

    return data[0]; // Retorna el staff actualizado
}
window.actualizarStaffPin = actualizarStaffPin;

async function agregarNotificacion(clienteId, msg) {
    const notificacion = {
        client_id: clienteId,
        msg: msg,
        read: false
    };

    const { data, error } = await supabase
        .from('notifications')
        .insert(notificacion)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error agregando notificación: ' + error.message);
        return null;
    }

    console.log("Notificación agregada: ", data);
    return data[0]; // Retorna la notificación agregada
}

window.agregarNotificacion = agregarNotificacion;

async function agregarRecompensa(recompensa) {
    const reward = {
        label: recompensa.label,
        label_en: recompensa.label,
        cost: recompensa.cost,
        icon: recompensa.icon
    };

    const { data, error } = await supabase
        .from('rewards')
        .insert(reward)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error agregando recompensa: ' + error.message);
        return null;
    }

    console.log("Recompensa agregada: ", data);
    return data[0]; // Retorna la recompensa agregada
}

window.agregarRecompensa = agregarRecompensa; // Hacer la función global para poder llamarla desde el HTML

async function eliminarRecompensa(id) {
    const { data, error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error:', error);
        alert('❌ Error eliminando experiencia: ' + error.message);
        return null;
    }

    console.log("Experiencia eliminada: ", id);
    return id; // Retorna la experiencia eliminada
}

window.eliminarRecompensa = eliminarRecompensa; // Hacer la función global para poder llamarla desde el HTML

async function agregarExperiencia(experienciaData) {
    const experiencia = {
        label: experienciaData.label,
        label_en: experienciaData.label,
        pts: experienciaData.pts,
        icon: experienciaData.icon
    };

    const { data, error } = await supabase
        .from('experiences')
        .insert(experiencia)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error agregando experiencia: ' + error.message);
        return null;
    }

    console.log("Experiencia agregada: ", data);
    return data[0]; // Retorna la experiencia agregada
}

window.agregarExperiencia = agregarExperiencia; // Hacer la función global para poder llamarla desde el HTML

async function eliminarExperiencia(id) {
    const { data, error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error:', error);
        alert('❌ Error eliminando experiencia: ' + error.message);
        return null;
    }

    console.log("Experiencia eliminada: ", id);
    return id; // Retorna la experiencia eliminada
}

window.eliminarExperiencia = eliminarExperiencia; // Hacer la función global para poder llamarla desde el HTML

async function agregarHistorial(clientId, historial) {
    const history = {
        client_id: clientId,
        date: historial.date,
        type: historial.type,
        delta: historial.delta
    };

    const { data, error } = await supabase
        .from('history')
        .insert(history)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error agregando historial: ' + error.message);
        return null;
    }

    console.log("Historial agregado: ", data);
    return data[0]; // Retorna el historial agregado
}

window.agregarHistorial = agregarHistorial; // Hacer la función global para poder llamarla desde el HTML


async function redeemRecompensa(clientId, historial) {
    const history = {
        client_id: clientId,
        date: historial.date,
        type: historial.type,
        delta: historial.delta
    };

    const { data, error } = await supabase
        .from('history')
        .insert(history)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error agregando historial: ' + error.message);
        return null;
    }

    console.log("Historial agregado: ", data);
    return data[0]; // Retorna el historial agregado
}

window.redeemRecompensa = redeemRecompensa; // Hacer la función global para poder llamarla desde el HTML

async function pedirRecompensa(clientId, historial) {
    const history = {
        client_id: clientId,
        date: historial.date,
        type: historial.type,
        delta: historial.delta
    };

    const { data, error } = await supabase
        .from('history')
        .insert(history)
        .select();

    if (error) {
        console.error('Error:', error);
        alert('❌ Error agregando historial: ' + error.message);
        return null;
    }

    console.log("Historial agregado: ", data);
    return data[0]; // Retorna el historial agregado
}

window.pedirRecompensa = pedirRecompensa; // Hacer la función global para poder llamarla desde el HTML