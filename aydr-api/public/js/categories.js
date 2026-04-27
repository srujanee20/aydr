$(document).ready(function() {
    $('.toggle-btn').click(function() {
        const id = $(this).data('id');
        $(this).prop('disabled', true);
        $.ajax({
            url: `/admin/categories/${id}/toggle`,
            type: 'PATCH',
            success: (res) => { if(res.success) location.reload(); },
            error: () => { alert('Server error'); $(this).prop('disabled', false); }
        });
    });

    $('.rename-btn').click(function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        $('#renameCategoryId').val(id);
        $('#renameInput').val(name);
        var renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
        renameModal.show();
    });

    $('#renameForm').submit(function(e) {
        e.preventDefault();
        const id = $('#renameCategoryId').val();
        const newName = $('#renameInput').val();
        $('#renameSubmitBtn').prop('disabled', true).text('Updating...');

        $.ajax({
            url: `/admin/categories/${id}/rename`,
            type: 'PATCH',
            data: { name: newName },
            success: (res) => { if(res.success) location.reload(); },
            error: (err) => { 
                alert(err.responseJSON?.error || 'Server error'); 
                $('#renameSubmitBtn').prop('disabled', false).text('Update Name');
            }
        });
    });
});
